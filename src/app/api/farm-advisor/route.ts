import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are AgriAdvisor, an expert AI agricultural advisor for Indian farmers.
Given a crop name, soil type, and region/location, provide comprehensive farming guidance.

IMPORTANT: Respond ONLY with a valid JSON object — no markdown fences, no explanation.
Use exactly this format:
{
  "crop": "crop name",
  "sowingTime": {
    "bestMonths": "e.g. June - July",
    "conditions": "ideal conditions for sowing (temperature, soil moisture, etc.)",
    "tips": "practical sowing tips"
  },
  "harvestTime": {
    "expectedDuration": "e.g. 120-150 days after sowing",
    "bestMonths": "e.g. October - November",
    "signs": "how to know the crop is ready to harvest"
  },
  "weather": {
    "idealTemp": "e.g. 20°C - 30°C",
    "rainfall": "ideal rainfall conditions",
    "warnings": "what weather to watch out for",
    "actionPlan": "what to do in adverse weather (drought, flood, frost, etc.)"
  },
  "fertilizer": {
    "basalDose": "what fertilizer to apply before/during sowing",
    "topDressing": "fertilizer schedule during growth stages",
    "organic": "organic alternatives",
    "schedule": "a simple timeline of fertilizer application"
  },
  "soil": {
    "idealType": "best soil types for this crop",
    "phRange": "ideal soil pH",
    "preparation": "how to prepare the soil",
    "amendments": "what to add if soil is not ideal"
  },
  "irrigation": {
    "method": "best irrigation method",
    "frequency": "how often to irrigate",
    "criticalStages": "when water is most critical"
  },
  "pestDisease": {
    "commonPests": "top 2-3 common pests",
    "commonDiseases": "top 2-3 common diseases",
    "prevention": "preventive measures"
  },
  "proTips": ["tip 1", "tip 2", "tip 3"]
}

Tailor advice to the specific region of India provided. Use practical, farmer-friendly language.
If the user mentions a non-agricultural item, respond with:
{"crop":"Invalid","sowingTime":{"bestMonths":"N/A","conditions":"N/A","tips":"Please enter a valid crop name."},"harvestTime":{"expectedDuration":"N/A","bestMonths":"N/A","signs":"N/A"},"weather":{"idealTemp":"N/A","rainfall":"N/A","warnings":"N/A","actionPlan":"N/A"},"fertilizer":{"basalDose":"N/A","topDressing":"N/A","organic":"N/A","schedule":"N/A"},"soil":{"idealType":"N/A","phRange":"N/A","preparation":"N/A","amendments":"N/A"},"irrigation":{"method":"N/A","frequency":"N/A","criticalStages":"N/A"},"pestDisease":{"commonPests":"N/A","commonDiseases":"N/A","prevention":"N/A"},"proTips":["Please enter a valid crop name to get farming advice."]}`;

async function askGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction: SYSTEM_PROMPT },
    contents: prompt,
  });
  const text = response.text?.trim() ?? "";
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

async function askGroq(
  prompt: string,
  apiKey: string
): Promise<string> {
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    max_tokens: 1500,
    temperature: 0.5,
  });
  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("Empty response from Groq");
  return text;
}

export async function POST(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return NextResponse.json(
      {
        success: false,
        error:
          "AI service is not configured. Please set GEMINI_API_KEY or GROQ_API_KEY.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { crop, soil, region } = body;

    if (!crop || crop.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a crop name" },
        { status: 400 }
      );
    }

    const userPrompt = `Provide complete farming guidance for:
Crop: ${crop.trim()}
Soil Type: ${soil?.trim() || "Not specified (suggest the best soil)"}
Region/Location: ${region?.trim() || "General India"}

Give me the full advisory in the JSON format specified.`;

    let text: string | null = null;
    let lastError = "";

    // Try Gemini first
    if (geminiKey) {
      try {
        text = await askGemini(userPrompt, geminiKey);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(
          "[farm-advisor] Gemini failed, trying Groq fallback:",
          lastError
        );
      }
    }

    // Fall back to Groq
    if (!text && groqKey) {
      try {
        text = await askGroq(userPrompt, groqKey);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error("[farm-advisor] Groq also failed:", lastError);
      }
    }

    if (!text) {
      return NextResponse.json(
        { success: false, error: lastError || "All AI providers failed" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    const jsonStr = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      // If AI returned prose instead of JSON, wrap it
      result = {
        crop: crop,
        rawAdvice: jsonStr.slice(0, 2000),
        parseError: true,
      };
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[farm-advisor]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
