import { GoogleGenAI } from "@google/genai";

const PROMPT = `Analyze this crop or plant leaf image and diagnose any disease or health condition.

Respond ONLY with a valid JSON object — no markdown fences, no explanation — in exactly this format:
{
  "disease": "disease name, or 'Healthy Crop' if no disease found",
  "confidence": "e.g. 94%",
  "treatment": "specific, actionable treatment recommendation",
  "fertilizer": "recommended fertilizer or soil amendment",
  "additionalInfo": "one sentence about severity or prevention tip"
}

If the image is NOT a plant, leaf, or crop, respond with:
{"disease":"Invalid Image","confidence":"0%","treatment":"Please upload a photo of a plant, leaf, or crop.","fertilizer":"N/A","additionalInfo":""}`;

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return Response.json(
            { error: "AI service not configured (missing GEMINI_API_KEY)" },
            { status: 503 }
        );
    }

    try {
        const body = await req.json();
        const { imageBase64, mimeType } = body;

        if (!imageBase64) {
            return Response.json(
                { error: "No image data provided" },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType || "image/jpeg",
                                data: imageBase64,
                            },
                        },
                        { text: PROMPT },
                    ],
                },
            ],
        });

        const raw = response.text?.trim() ?? "";

        // Strip any accidental markdown fences
        const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

        let result;
        try {
            result = JSON.parse(jsonStr);
        } catch {
            // If Gemini returned prose instead of JSON, wrap it gracefully
            result = {
                disease: "Analysis Complete",
                confidence: "N/A",
                treatment: raw.slice(0, 200),
                fertilizer: "Consult local agronomist",
                additionalInfo: "",
            };
        }

        return Response.json(result);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[diagnose]", message);
        return Response.json(
            { error: `Diagnosis failed: ${message}` },
            { status: 500 }
        );
    }
}