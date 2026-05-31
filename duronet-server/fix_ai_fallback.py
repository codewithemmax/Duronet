from pathlib import Path

path = Path('src/services/ai.ts')
text = path.read_text(encoding='utf-8')

replacements = [
    (
        "export async function searchShortages(query: string, activeShortages: any[]) {\n  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');\n\n  const systemPrompt = `You are the DuroNet Semantic Search Copilot.\n",
        "export async function searchShortages(query: string, activeShortages: any[]) {\n  if (!GEMINI_API_KEY) {\n    console.warn('GEMINI_API_KEY not configured. Falling back to local semantic search.');\n    return localShortageSearch(query, activeShortages);\n  }\n\n  const systemPrompt = `You are the DuroNet Semantic Search Copilot.\n"
    ),
    (
        "export async function analyzeRisk(alertPayload: any, gpoMetrics: any) {\n  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured.');\n\n  const systemPrompt = `You are an expert AI supply chain analyst and data engineer for DuroNet.\n",
        "export async function analyzeRisk(alertPayload: any, gpoMetrics: any) {\n  if (!GEMINI_API_KEY) {\n    console.warn('GEMINI_API_KEY not configured. Falling back to local AI analysis.');\n    return buildFallbackAIResponse(alertPayload, gpoMetrics);\n  }\n\n  const systemPrompt = `You are an expert AI supply chain analyst and data engineer for DuroNet.\n"
    ),
    (
        "  } catch (err: any) {\n    if (err instanceof ZodError) {\n      console.error('Validation error from Gemini (shortage):', err.issues);\n      throw err;\n    }\n    console.error('Gemini error (shortage):', err);\n    throw new Error('Failed to analyze shortage risk');\n  }\n}\n",
        "  } catch (err: any) {\n    if (err instanceof ZodError) {\n      console.error('Validation error from Gemini (shortage):', err.issues);\n      throw err;\n    }\n    console.error('Gemini error (shortage):', err);\n    if (isGeminiNetworkError(err)) {\n      console.warn('Network error detected while calling Gemini for shortage analysis. Using local fallback.');\n      return buildFallbackShortageAnalysis(shortageAlert, requestedAmount);\n    }\n    throw new Error('Failed to analyze shortage risk');\n  }\n}\n"
    ),
]

original = text
for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Missing pattern:\n{old}')
    text = text.replace(old, new, 1)

if text == original:
    raise SystemExit('No replacements applied.')

path.write_text(text, encoding='utf-8')
print('Patch applied successfully')
