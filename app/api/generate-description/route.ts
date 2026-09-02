export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 🔐 1. Get token
    const token = req.headers
      .get("Authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔐 2. Get user
    const { data: userData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = userData.user;

    // 📊 3. Get profile
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("credits_total, credits_used")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const remaining =
      (profile.credits_total || 0) -
      (profile.credits_used || 0);

    // 🚫 4. Check credits
    if (remaining < 1) {
      return NextResponse.json(
        { error: "No credits left" },
        { status: 403 }
      );
    }

    // 📥 5. Get request data
    const { title, location, bedrooms, bathrooms, price } =
      await req.json();

    // 🤖 6. Generate AI
    const prompt = `
Write a compelling real estate listing description for a Nigerian audience.

Property:
- Title: ${title}
- Location: ${location}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Price: ₦${price}

Requirements:
- Professional and persuasive
- Highlight lifestyle and comfort
- Simple English
- Under 100 words
- Suitable for WhatsApp

Get started.
`;

let completion;

try {
  completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
} catch (openaiError: unknown) {
  console.error("OpenAI failed:", openaiError);

  const errorMessage =
    openaiError instanceof Error ? openaiError.message : "";

  return NextResponse.json(
    {
      error: errorMessage.includes("quota")
        ? "AI service unavailable. Please fund your OpenAI account."
        : "Failed to generate description",
    },
    { status: 503 }
  );
}

    const description =
      completion.choices[0]?.message?.content?.trim() ||
      "No description generated.";

    // 💳 7. Deduct credit
    await supabase
      .from("profiles")
      .update({
        credits_used: profile.credits_used + 1,
      })
      .eq("id", user.id);
      await supabase
  .from("credit_transactions")
  .insert({
    user_id: user.id,
    type: "ai_generation",
    credits: -1,
    description: "Generated property description",
  });

    // ✅ 8. Return result + remaining credits
    return NextResponse.json({
      description,
      creditsRemaining: remaining - 1,
    });
  } catch (error: unknown) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}