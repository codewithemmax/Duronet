import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fdaAlerts from './data/fda-alerts.json';
import gpoMetrics from './data/gpo-metrics.json';
import drugShortages from './data/drug-shortages.json';
import hospitalTelemetry from './data/hospital-telemetry.json';
import { analyzeRisk, analyzeShortageRisk } from './services/ai';
import { ZodError } from 'zod';
import { deployFivetranConnector } from './services/fivetran';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/inventory/status', (req, res) => {
  res.json({
    shortages: drugShortages,
    telemetry: hospitalTelemetry
  });
});

app.get('/api/inventory/predict', (req, res) => {
  const drugName = String(req.query.drug || 'Albuterol Sulfate');
  const livePatientInflux = Number(req.query.patients ?? 42);
  const dosagePerPatient = Number(req.query.dosagePerPatient ?? 6);
  const thresholdDays = 5.0;

  if (!drugName) {
    return res.status(400).json({ error: 'Missing drug query parameter' });
  }

  if (Number.isNaN(livePatientInflux) || livePatientInflux < 0) {
    return res.status(400).json({ error: 'Invalid live patient influx value' });
  }

  if (Number.isNaN(dosagePerPatient) || dosagePerPatient <= 0) {
    return res.status(400).json({ error: 'Invalid dosage per patient value' });
  }

  const dailyBurnRate = livePatientInflux * dosagePerPatient;

  const predictions = hospitalTelemetry.map((hospital) => {
    const drugInventory = hospital.inventory[drugName as keyof typeof hospital.inventory];
    const currentInventory = drugInventory?.currentStock ?? 0;
    const daysOfSupplyRemaining = dailyBurnRate > 0
      ? Number((currentInventory / dailyBurnRate).toFixed(2))
      : null;

    const status = daysOfSupplyRemaining === null
      ? 'DATA_UNAVAILABLE'
      : daysOfSupplyRemaining < thresholdDays
      ? 'CRITICAL_SHORTAGE_IMMINENT'
      : 'STABLE';

    return {
      hospitalId: hospital.hospitalId,
      name: hospital.name,
      region: hospital.region,
      drugName,
      currentInventory,
      dailyBurnRate,
      daysOfSupplyRemaining,
      status,
    };
  });

  res.json({
    drugName,
    livePatientInflux,
    dosagePerPatient,
    thresholdDays,
    dailyBurnRate,
    predictions,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/logistics/status', (req, res) => {
  res.json({
    alerts: fdaAlerts,
    metrics: gpoMetrics
  });
});

app.get('/api/fda-alerts', (req, res) => {
  res.json(fdaAlerts);
});

app.get('/api/gpo-metrics', (req, res) => {
  res.json(gpoMetrics);
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const alertPayload = req.body.alert;
    
    if (!alertPayload) {
      return res.status(400).json({ error: 'Missing alert payload in request body' });
    }

    const aiAnalysis = await analyzeRisk(alertPayload, gpoMetrics);
    res.json(aiAnalysis);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Invalid AI response format', details: error.issues });
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Unit 04: Shortage Risk Analysis Endpoint
// POST /api/ai/analyze-shortage
// Accepts a shortage alert and requested quantity, returns regional surplus recommendation
app.post('/api/ai/analyze-shortage', async (req, res) => {
  try {
    const { shortage, requestedAmount } = req.body;

    if (!shortage) {
      return res.status(400).json({ error: 'Missing shortage payload in request body' });
    }

    if (typeof requestedAmount !== 'number' || requestedAmount <= 0) {
      return res.status(400).json({ error: 'Invalid requestedAmount: must be a positive number' });
    }

    // Call the Unit 04 Gemini Prescriptive Analytics Copilot
    const analysis = await analyzeShortageRisk(shortage, requestedAmount, hospitalTelemetry);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Shortage Risk Analysis Error:', error);
    if (error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid AI response format', details: error.errors });
    }
    res.status(500).json({
      error: error.message || 'Failed to analyze shortage risk',
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/deploy', async (req, res) => {
  try {
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid config payload in request body' });
    }

    const result = await deployFivetranConnector(config);

    if (!result || !result.connectorId) {
      return res.status(502).json({ error: 'Fivetran connector creation failed without a valid connector ID' });
    }

    res.status(201).json({
      message: 'Deployment Successful',
      connectorId: result.connectorId,
      result,
    });
  } catch (error: any) {
    console.error('Deployment Error:', error);

    const message = error?.message || 'Internal Server Error';
    if (message.toLowerCase().includes('missing') || message.toLowerCase().includes('invalid')) {
      return res.status(400).json({ error: message });
    }

    res.status(502).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`DuroNet server listening on port ${port}`);
});
