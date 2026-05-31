import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';
import { z, ZodError } from 'zod';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not configured. AI calls will fail without a key.');
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ----------------------------
// Zod schemas
// ----------------------------

const SurplusDataSchema = z.object({
  hub: z.string(),
  totalStock: z.number(),
  committed: z.number(),
  available: z.number(),
  requested: z.number(),
  isFeasible: z.boolean(),
});

const ShortageAnalysisResponseSchema = z.object({
  surplusData: SurplusDataSchema,
  mitigationStrategy: z.string(),
  stakeholdersRequired: z.array(z.string()),
});

type ShortageAnalysisResponse = z.infer<typeof ShortageAnalysisResponseSchema>;

const FivetranConfigSchema = z.object({
  service: z.string(),
  group_id: z.string(),
  paused: z.boolean().optional(),
  sync_frequency: z.number().optional(),
  config: z.record(z.string(), z.any()),
});

const FivetranPayloadSchema = z.object({
  service: z.string(),
  config: z.object({
    schema: z.string(),
    table: z.string(),
    sheet_id: z.string(),
    named_range: z.string(),
  }),
});

const AIResponseSchema = z.object({
  riskAnalysis: z.string(),
  alternateManufacturerRecommendation: z.string(),
  surplusData: SurplusDataSchema,
  fivetranConfigDraft: FivetranConfigSchema,
  fivetranPayload: FivetranPayloadSchema,
});

type AIResponse = z.infer<typeof AIResponseSchema>;

// ----------------------------
// analyzeShortageRisk
// ----------------------------
export async function analyzeShortageRisk(
  shortageAlert: any,
  requestedAmount: number,
  hospitalTelemetry: any[] = []
): Promise<ShortageAnalysisResponse> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');

  const systemPrompt = `You are a Hospital Supply Chain Copilot for DuroNet.\n\nCRITICAL: ZERO-PHI BOUNDARY - Do NOT process or mention PHI, patient data, or EHR. Work strictly with aggregate inventory, burn rates, and logistics.\n\nReturn only valid JSON that matches the required schema.`;

  const userPrompt = `Shortage Alert:\n${JSON.stringify(shortageAlert, null, 2)}\n\nRequested Amount: ${requestedAmount}\n\nHospital Telemetry:\n${JSON.stringify(hospitalTelemetry, null, 2)}\n\nRespond with a JSON object: {"surplusData": {"hub":string,"totalStock":number,"committed":number,"available":number,"requested":number,"isFeasible":boolean}, "mitigationStrategy": string, "stakeholdersRequired": [string] }`;

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
      stakeholdersRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['surplusData', 'mitigationStrategy', 'stakeholdersRequired'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }, { text: userPrompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    if (!response.text) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(response.text);
    const validated = ShortageAnalysisResponseSchema.parse(parsed);
    return validated;
  } catch (err: any) {
    if (err instanceof ZodError) {
      console.error('Validation error from Gemini (shortage):', err.issues);
      throw err;
    }
    console.error('Gemini error (shortage):', err);
    throw new Error('Failed to analyze shortage risk');
  }
}

// ----------------------------
// analyzeRisk (Unit 05 expansion)
// ----------------------------
export async function analyzeRisk(alertPayload: any, gpoMetrics: any) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');

  const systemPrompt = `You are an expert AI supply chain analyst and data engineer for DuroNet.\n\nCRITICAL: ZERO-PHI BOUNDARY - Never process or mention PHI or patient data. Work only with aggregate inventory, supplier reliability, and logistics.\n\nYour tasks: 1) Analyze risk and recommend alternate manufacturers. 2) As a Data Engineer, DRAFT a Fivetran connector payload (fivetranPayload) to ingest the supplier's inventory feed into a destination (schema/table). This is a DRAFT only and must NOT be executed without human approval and proper secrets.`;

  const userPrompt = `FDA Alert:\n${JSON.stringify(alertPayload, null, 2)}\n\nGPO Metrics:\n${JSON.stringify(gpoMetrics, null, 2)}\n\nReturn a single JSON object containing: riskAnalysis, alternateManufacturerRecommendation, surplusData, fivetranConfigDraft, and fivetranPayload.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      riskAnalysis: { type: Type.STRING },
      alternateManufacturerRecommendation: { type: Type.STRING },
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
      fivetranConfigDraft: {
        type: Type.OBJECT,
        properties: {
          service: { type: Type.STRING },
          group_id: { type: Type.STRING },
          paused: { type: Type.BOOLEAN },
          sync_frequency: { type: Type.INTEGER },
          config: { type: Type.OBJECT },
        },
        required: ['service', 'group_id', 'config'],
      },
      fivetranPayload: {
        type: Type.OBJECT,
        properties: {
          service: { type: Type.STRING },
          config: {
            type: Type.OBJECT,
            properties: {
              schema: { type: Type.STRING },
              table: { type: Type.STRING },
              sheet_id: { type: Type.STRING },
              named_range: { type: Type.STRING },
            },
            required: ['schema', 'table', 'sheet_id', 'named_range'],
          },
        },
        required: ['service', 'config'],
      },
    },
    required: ['riskAnalysis', 'alternateManufacturerRecommendation', 'surplusData', 'fivetranConfigDraft', 'fivetranPayload'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }, { text: userPrompt }],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    if (!response.text) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(response.text);
    const validated = AIResponseSchema.parse(parsed);
    return validated;
  } catch (err: any) {
    if (err instanceof ZodError) {
      console.error('Validation error from Gemini (ai):', err.issues);
      throw err;
    }
    console.error('Gemini error (ai):', err);
    throw new Error('Failed to generate AI analysis');
  }
}
