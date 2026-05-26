import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
                description: "A detailed explanation of the supply chain risk and its potential impact.",
            },
            alternateManufacturerRecommendation: {
                type: Type.STRING,
                description: "The recommended alternate manufacturer to mitigate the risk based on reliability scores.",
            },
            fivetranConfigDraft: {
                type: Type.OBJECT,
                description: "Draft JSON payload for Fivetran API to create a connector for the alternate supplier.",
                properties: {
                    service: { type: Type.STRING },
                    group_id: { type: Type.STRING },
                    paused: { type: Type.BOOLEAN },
                    sync_frequency: { type: Type.INTEGER },
                    config: { type: Type.OBJECT }
                },
                required: ["service", "group_id", "config"]
            }
        },
        required: ["riskAnalysis", "alternateManufacturerRecommendation", "fivetranConfigDraft"],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            }
        });

        if (response.text) {
            const parsedData = JSON.parse(response.text);
            
            // Validate the parsed data with strict Zod schema
            const validatedData = AIResponseSchema.parse(parsedData);
            
            return validatedData;
        }
        throw new Error("Empty response from Gemini.");
    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw new Error("Failed to generate and validate AI analysis.");
    }
}
