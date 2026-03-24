export const runtime = "nodejs"; // ✅ ensures server-side environment vars are accessible

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { title, location, bedrooms, bathrooms, price } = await req.json();

    const prompt = `
    Write a professional and engaging real estate listing description for the following property:
    - Title: ${title}
    - Location: ${location}
    - Bedrooms: ${bedrooms}
    - Bathrooms: ${bathrooms}
    - Price: ₦${price}
    Focus on key selling points, lifestyle appeal, and quality of the property. Keep it under 120 words.
    `;

    // ✅ Chat completion request
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const description = completion.choices[0]?.message?.content?.trim() || "No description generated.";

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("AI Generation Error:", error.message || error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
