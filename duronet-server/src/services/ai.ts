import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Initialize the Google Gen AI client with explicit model and API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables.');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

// ============================================
// UNIT 04: Shortage Risk Analysis Schema
// ============================================

const SurplusDataSchema = z.object({
  hub: z.string().describe('Regional hub name (e.g., Regional Hub B)'),
  totalStock: z.number().describe('Total units in stock at the surplus hub'),
  committed: z.number().describe('Units already committed to other orders'),
  available: z.number().describe('Truly available units (totalStock - committed)'),
  requested: z.number().describe('Units requested for emergency transfer'),
  isFeasible: z.boolean().describe('Whether the transfer is logistically feasible'),
});

const ShortageAnalysisResponseSchema = z.object({
  surplusData: SurplusDataSchema,
  mitigationStrategy: z.string().describe('Concise explanation of the recommended transfer strategy'),
  stakeholdersRequired: z.array(z.string()).describe('List of stakeholder roles required for approval'),
});

type ShortageAnalysisResponse = z.infer<typeof ShortageAnalysisResponseSchema>;

/**
 * Analyze a shortage alert and recommend an emergency regional surplus transfer.
 * This function acts as a Prescriptive Analytics Copilot, identifying feasible
 * inventory transfers to mitigate critical shortages.
 *
 * @param shortageAlert - The shortage alert data (drugName, severity, affectedRegions, etc.)
 * @param requestedAmount - The quantity needed for the emergency transfer
 * @param hospitalTelemetry - Regional hospital inventory data
 * @returns Structured JSON with surplus location, feasibility, and mitigation strategy
 */
export async function analyzeShortageRisk(
  shortageAlert: any,
  requestedAmount: number,
  hospitalTelemetry: any[] = []
): Promise<ShortageAnalysisResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.');
  }

  const systemPrompt = `You are an expert Hospital Supply Chain Copilot for DuroNet.

CRITICAL RULE - Zero-PHI Boundary:
- NEVER process, infer, or mention Protected Health Information (PHI), patient data, or Electronic Health Records (EHR).
- NEVER reference specific hospital names, patient counts, or clinical outcomes.
- Focus STRICTLY on upstream GPO metrics, inventory telemetry (stock levels, burn rates), and logistics feasibility.
- You are an agent, NOT a clinician. Your role is purely supply chain optimization.

Your Task:
Given a critical drug shortage alert and hospital inventory telemetry data, your job is to:
1. Identify regional hubs with surplus inventory of the requested drug.
2. Calculate logistical feasibility by comparing "available" units (Total - Committed) against the requested quantity.
3. Recommend the best regional surplus to route the emergency transfer.
4. Provide a concise mitigation strategy explaining the transfer route.
5. Identify stakeholders who must approve the transfer (always include "Pharmacy Director" and "Supply Chain Manager").

Return your response as a valid JSON object with NO additional text, NO markdown, NO code blocks.`;

  const userPrompt = `Shortage Alert:
${JSON.stringify(shortageAlert, null, 2)}

Requested Emergency Transfer Quantity: ${requestedAmount} units

Regional Hospital Telemetry Data:
${JSON.stringify(hospitalTelemetry, null, 2)}

Based on this data, identify the best regional hub to source the surplus inventory and provide the mitigation strategy.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      surplusData: {
        type: Type.OBJECT,
        properties: {
          hub: { type: Type.STRING },
          totalStock: { type: Type.INTEGER },
          committed: { type: Type.INTEGER },
          available: { type: Type.INTEGER },
          requested: { type: Type.INTEGER },
          isFeasible: { type: Type.BOOLEAN },
        },
        required: ['hub', 'totalStock', 'committed', 'available', 'requested', 'isFeasible'],
      },
      mitigationStrategy: { type: Type.STRING },
      stakeholdersRequired: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    required: ['surplusData', 'mitigationStrategy', 'stakeholdersRequired'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: userPrompt },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini API.');
    }

    // Parse and validate the response
    const parsedResponse = JSON.parse(response.text);
    const validatedResponse = ShortageAnalysisResponseSchema.parse(parsedResponse);

    return validatedResponse;
  } catch (error: any) {
    console.error('Shortage Risk Analysis Error:', error);
    throw new Error(`Failed to analyze shortage risk: ${error.message}`);
  }
}

// ============================================
// LEGACY: Unit 06 Risk Analysis (for FDA Alerts)
// ============================================

const FivetranConfigSchema = z.object({
  service: z.string(),
  group_id: z.string(),
  paused: z.boolean().optional(),
  sync_frequency: z.number().optional(),
  config: z.record(z.string(), z.any()),
});

const AIResponseSchema = z.object({
  riskAnalysis: z.string(),
  alternateManufacturerRecommendation: z.string(),
  fivetranConfigDraft: FivetranConfigSchema,
});

export async function analyzeRisk(alertPayload: any, gpoMetrics: any) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.');
  }

  const prompt = `
You are an expert AI supply chain risk analyst for DuroNet.
Analyze the following FDA supply chain alert against the provided regional GPO purchase metrics.

CRITICAL RULE (Zero-PHI Boundary): You must NEVER process, infer, or mention any Protected Health Information (PHI), patient data, or Electronic Health Records (EHR). Focus strictly on upstream GPO metrics, logistics, and supplier reliability.

FDA Alert:
${JSON.stringify(alertPayload, null, 2)}

GPO Metrics:
${JSON.stringify(gpoMetrics, null, 2)}

Provide your response as a structured JSON object containing:
- riskAnalysis: A detailed explanation of the supply chain risk and its potential impact.
- alternateManufacturerRecommendation: The recommended alternate manufacturer to mitigate the risk, chosen based on the GPO metrics and reliability scores.
- fivetranConfigDraft: A draft payload for creating a Fivetran connector to integrate with the recommended manufacturer's data system. Map this strictly to standard Fivetran REST API parameters (service, group_id, config). Use mock/placeholder values for group_id and authentication config, but base the service/schema details logically on the alternate supplier recommendation.
`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      riskAnalysis: {
        type: Type.STRING,
        description: 'A detailed explanation of the supply chain risk and its potential impact.',
      },
      alternateManufacturerRecommendation: {
        type: Type.STRING,
        description: 'The recommended alternate manufacturer to mitigate the risk based on reliability scores.',
      },
      fivetranConfigDraft: {
        type: Type.OBJECT,
        description: 'Draft JSON payload for Fivetran API to create a connector for the alternate supplier.',
        properties: {
          service: { type: Type.STRING },
          group_id: { type: Type.STRING },
          paused: { type: Type.BOOLEAN },
          sync_frequency: { type: Type.INTEGER },
          config: { type: Type.OBJECT },
        },
        required: ['service', 'group_id', 'config'],
      },
    },
    required: ['riskAnalysis', 'alternateManufacturerRecommendation', 'fivetranConfigDraft'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from Gemini API.');
    }

    const parsedData = JSON.parse(response.text);
    const validatedData = AIResponseSchema.parse(parsedData);

    return validatedData;
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    throw new Error(`Failed to generate and validate AI analysis: ${error.message}`);
  }
}
