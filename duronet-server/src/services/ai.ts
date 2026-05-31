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

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function localShortageSearch(query: string, activeShortages: any[]) {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const scores = activeShortages.map((shortage) => {
    const name = String(shortage.drugName || '').toLowerCase();
    const reason = String(shortage.shortageReason || '').toLowerCase();
    const regions = (shortage.affectedRegions || []).map(String).join(' ').toLowerCase();
    const id = String(shortage.id || '').toLowerCase();

    let score = 0;
    if (name.includes(normalized)) score += 100;
    if (reason.includes(normalized)) score += 40;
    if (regions.includes(normalized)) score += 20;
    if (id.includes(normalized)) score += 30;

    const words = normalized.split(/\s+/);
    words.forEach((word) => {
      if (name.includes(word)) score += 15;
      if (reason.includes(word)) score += 10;
      if (regions.includes(word)) score += 5;
    });

    return { score, shortage };
  });

  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.shortage);
}

function buildFallbackAIResponse(alertPayload: any, gpoMetrics: any): AIResponse {
  const productName = String(alertPayload.product || alertPayload.drugName || 'the product');
  const severity = String(alertPayload.severity || 'medium').toLowerCase();
  const isCritical = severity === 'critical' || severity === 'high';
  const available = isCritical ? 120 : 320;
  const committed = isCritical ? 95 : 160;
  const requested = isCritical ? 72 : 44;

  return {
    riskAnalysis: `Fallback AI analysis for ${productName}. Based on current FDA alert severity and regional supplier reliability, the product is ${isCritical ? 'at high supply risk' : 'vulnerable but manageable'}.`,
    alternateManufacturerRecommendation: `Consider sourcing ${productName} from alternate verified distributors and prioritize high-reliability suppliers with established regional logistics support.`,
    surplusData: {
      hub: 'Fallback Supply Hub',
      totalStock: 520,
      committed,
      available,
      requested,
      isFeasible: available >= requested,
    },
    fivetranConfigDraft: {
      service: 'fivetran',
      group_id: `duro-net-fallback-${Date.now()}`,
      paused: true,
      sync_frequency: 60,
      config: {
        schema: 'duro_net',
        table: 'fda_alerts',
        source: 'fallback',
        alertProduct: productName,
      },
    },
    fivetranPayload: {
      service: 'fivetran',
      config: {
        schema: 'duro_net',
        table: 'fda_alerts',
        sheet_id: 'fallback_sheet',
        named_range: 'A1:D1',
      },
    },
  };
}

function buildFallbackShortageAnalysis(shortageAlert: any, requestedAmount: number): ShortageAnalysisResponse {
  const productName = String(shortageAlert.drugName || shortageAlert.product || 'product');
  const isHighRisk = String(shortageAlert.severity || '').toLowerCase() === 'critical';
  const available = Math.max(0, requestedAmount * (isHighRisk ? 2 : 4));

  return {
    surplusData: {
      hub: 'Fallback Distribution Hub',
      totalStock: requestedAmount * 4,
      committed: requestedAmount * 2,
      available,
      requested: requestedAmount,
      isFeasible: available >= requestedAmount,
    },
    mitigationStrategy: `Use priority rerouting and alternate supplier channels for ${productName}. Increase inventory visibility and expedite shipments for high-risk shortages.`,
    stakeholdersRequired: ['Pharmacy Director', 'Supply Chain Manager'],
  };
}

function isGeminiNetworkError(err: any) {
  const code = err?.cause?.code || err?.code || err?.cause?.cause?.code;
  return code === 'UND_ERR_CONNECT_TIMEOUT' || code === 'UND_ERR_SOCKET' || code === 'ECONNRESET' || code === 'EAI_AGAIN';
}

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
    if (isGeminiNetworkError(err)) {
      console.warn('Network error detected while calling Gemini for shortage analysis. Using local fallback.');
      return buildFallbackShortageAnalysis(shortageAlert, requestedAmount);
    }
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
    if (isGeminiNetworkError(err)) {
      console.warn('Network error detected while calling Gemini AI analysis. Using local fallback response.');
      return buildFallbackAIResponse(alertPayload, gpoMetrics);
    }
    throw new Error('Failed to generate AI analysis');
  }
}

export async function searchShortages(query: string, activeShortages: any[]) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');

  const systemPrompt = `You are the DuroNet Semantic Search Copilot.\n\nCRITICAL: ZERO-PHI BOUNDARY - Do NOT process or mention PHI, patient data, or EHR. Work only with the active shortage inventory data provided.\n\nYour job is to map the user's search query to the correct active drug shortages using intent, synonyms, misspellings, brand/generic names, and symptom associations. Return ONLY a strict JSON array of matching shortage objects. If nothing matches, return an empty array [].`;

  const userPrompt = `User Query: "${query}"\n\nActive Shortages:\n${JSON.stringify(activeShortages, null, 2)}\n\nReturn only a JSON array of objects with these fields:\n- id\n- drugName\n- severity\n- affectedRegions\n- shortageReason\n- estimatedResolution\n\nDo not include any extra text, explanation, or markdown.`;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        drugName: { type: Type.STRING },
        severity: { type: Type.STRING },
        affectedRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
        shortageReason: { type: Type.STRING },
        estimatedResolution: { type: Type.STRING },
      },
      required: ['id', 'drugName', 'severity', 'affectedRegions', 'shortageReason', 'estimatedResolution'],
    },
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
        responseSchema,
      },
    });

    if (!response.text) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (err: any) {
    console.error('Gemini error (search):', err);
    if (isGeminiNetworkError(err)) {
      console.warn('Network error detected while calling Gemini search. Falling back to local semantic matcher.');
      return localShortageSearch(query, activeShortages);
    }
    throw new Error('Failed to execute semantic search');
  }
}
