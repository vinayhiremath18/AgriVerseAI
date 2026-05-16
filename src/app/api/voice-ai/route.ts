import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION =
  "You are AgriBot, an expert agricultural AI assistant for Indian farmers. " +
  "Answer questions about crops, diseases, pests, weather, mandi prices, farming techniques, soil health, irrigation, and related agricultural topics. " +
  "Keep every reply to 2-3 short sentences — responses are read aloud via text-to-speech, so be concise and conversational. " +
  "Always respond in the same language as the user's message (English, Hindi, or Kannada). " +
  "Never use markdown, bullet points, or special characters in your response.";

async function askGemini(transcript: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: { systemInstruction: SYSTEM_INSTRUCTION },
    contents: transcript.trim(),
  });
  const text = response.text?.trim() ?? "";
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

async function askGroq(transcript: string, apiKey: string): Promise<string> {
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: transcript.trim() },
    ],
    model: "llama-3.3-70b-versatile",
    max_tokens: 150,
    temperature: 0.7,
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
      { success: false, error: "AI service is not configured. Please set GEMINI_API_KEY or GROQ_API_KEY." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const transcript: string = body.transcript;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "No transcript provided" },
        { status: 400 }
      );
    }

    let text: string | null = null;
    let lastError = "";

    // Try Gemini first
    if (geminiKey) {
      try {
        text = await askGemini(transcript, geminiKey);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn("[voice-ai] Gemini failed, trying Groq fallback:", lastError);
      }
    }

    // Fall back to Groq
    if (!text && groqKey) {
      try {
        text = await askGroq(transcript, groqKey);
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error("[voice-ai] Groq also failed:", lastError);
      }
    }

    if (!text) {
      return NextResponse.json(
        { success: false, error: lastError || "All AI providers failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reply: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[voice-ai]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}