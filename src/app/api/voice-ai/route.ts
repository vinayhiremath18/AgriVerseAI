import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const transcript = body.transcript;

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "No transcript" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(transcript);

    const response = await result.response;

    const text = response.text();

    return NextResponse.json({
      success: true,
      reply: text,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}