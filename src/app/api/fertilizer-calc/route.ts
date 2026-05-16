import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are AgriCalc, an expert agricultural calculator for Indian farmers.
Given crop type, farm area (in acres), soil type, and current season, compute precise fertilizer and irrigation requirements.

IMPORTANT: Respond ONLY with a valid JSON object — no markdown fences, no explanation.
Use exactly this format:
{
  "crop": "crop name",
  "area": "farm area with unit",
  "npk": {
    "nitrogen": { "kg": 0, "source": "Urea (46-0-0)", "sourceKg": 0, "pricePerKg": 0, "totalCost": 0 },
    "phosphorus": { "kg": 0, "source": "DAP (18-46-0)", "sourceKg": 0, "pricePerKg": 0, "totalCost": 0 },
    "potassium": { "kg": 0, "source": "MOP (0-0-60)", "sourceKg": 0, "pricePerKg": 0, "totalCost": 0 }
  },
  "micronutrients": [
    { "name": "Zinc Sulphate", "kg": 0, "pricePerKg": 0, "totalCost": 0 }
  ],
  "organicAlternative": {
    "options": "FYM/Vermicompost/Neem cake recommendations",
    "quantity": "how much per acre",
    "estimatedCost": 0
  },
  "applicationSchedule": [
    { "stage": "Basal (at sowing)", "timing": "Before/during sowing", "urea": "X kg", "dap": "X kg", "mop": "X kg", "notes": "apply details" },
    { "stage": "First Top Dressing", "timing": "X days after sowing", "urea": "X kg", "dap": "-", "mop": "-", "notes": "details" },
    { "stage": "Second Top Dressing", "timing": "X days after sowing", "urea": "X kg", "dap": "-", "mop": "-", "notes": "details" }
  ],
  "irrigation": {
    "method": "recommended irrigation method",
    "schedule": [
      { "stage": "Germination/Seedling", "daysAfterSowing": "0-15", "frequencyDays": 3, "waterLiters": 0, "notes": "details" },
      { "stage": "Vegetative", "daysAfterSowing": "15-45", "frequencyDays": 5, "waterLiters": 0, "notes": "details" },
      { "stage": "Flowering", "daysAfterSowing": "45-75", "frequencyDays": 4, "waterLiters": 0, "notes": "critical stage" },
      { "stage": "Maturity", "daysAfterSowing": "75-120", "frequencyDays": 7, "waterLiters": 0, "notes": "reduce gradually" }
    ],
    "totalWaterNeeded": "total water in liters for full season",
    "rainfedNote": "advice if relying on rain"
  },
  "costBreakdown": {
    "fertilizerCost": 0,
    "micronutrientCost": 0,
    "irrigationCost": 0,
    "totalCost": 0,
    "costPerAcre": 0
  },
  "govSchemes": [
    {
      "name": "Scheme name",
      "description": "1-2 line description",
      "discount": "percentage or flat amount",
      "savings": 0,
      "howToApply": "brief steps to apply"
    }
  ],
  "finalCostAfterSubsidy": 0,
  "totalSavings": 0,
  "season": "current season",
  "soilType": "soil type"
}

Rules:
- All prices in INR (Indian Rupees) at current 2025-2026 market rates.
- Include at least 2-3 relevant Indian government schemes (PM-KISAN, Soil Health Card, Neem Coated Urea subsidy, PKVY, DBT fertilizer subsidy, state-specific schemes).
- NPK values should be scientifically accurate for the given crop and area.
- Irrigation schedule must account for the season (kharif/rabi/summer).
- Water quantities in liters per acre.
- If soil type affects recommendations, adjust accordingly.`;

async function askGemini(prompt: string, apiKey: string): Promise<string> {
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

async function askGroq(prompt: string, apiKey: string): Promise<string> {
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    max_tokens: 2000,
    temperature: 0.3,
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
      { success: false, error: "AI service is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { crop, area, soil, season } = body;

    if (!crop?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a crop name" },
        { status: 400 }
      );
    }

    const userPrompt = `Calculate precise fertilizer and irrigation requirements for:
Crop: ${crop.trim()}
Farm Area: ${area || 1} acres
Soil Type: ${soil?.trim() || "Loamy Soil"}
Current Season: ${season?.trim() || "Kharif"}

Provide the full calculation in the JSON format specified.`;

    let text: string | null = null;
    let lastError = "";

    if (geminiKey) {
      try {
        text = await askGemini(userPrompt, geminiKey);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn("[fertilizer-calc] Gemini failed:", lastError);
      }
    }

    if (!text && groqKey) {
      try {
        text = await askGroq(userPrompt, groqKey);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error("[fertilizer-calc] Groq also failed:", lastError);
      }
    }

    if (!text) {
      return NextResponse.json(
        { success: false, error: lastError || "All AI providers failed" },
        { status: 500 }
      );
    }

    const jsonStr = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      result = { crop, rawData: jsonStr.slice(0, 3000), parseError: true };
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[fertilizer-calc]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
