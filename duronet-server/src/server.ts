import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fdaAlerts from './data/fda-alerts.json';
import gpoMetrics from './data/gpo-metrics.json';
import { analyzeRisk } from './services/ai';
import { deployFivetranConnector } from './services/fivetran';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.post('/api/deploy', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ error: 'Missing config payload in request body' });
    }

    const result = await deployFivetranConnector(config);
    res.status(201).json({ message: 'Deployment Successful', result });
  } catch (error: any) {
    console.error('Deployment Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`DuroNet server listening on port ${port}`);
});
