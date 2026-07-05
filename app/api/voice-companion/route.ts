import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient, hasOpenAI } from "@/lib/openai/client";
import { COMPANION_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { FALLBACK_COMPANION } from "@/lib/demo-data/fallback-messages";

const schema = z.object({
  elderName: z.string(),
  message: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    if (!hasOpenAI()) {
      return NextResponse.json({ ...FALLBACK_COMPANION, source: "fallback" });
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: COMPANION_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            elderName: body.elderName,
            message: body.message,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    return NextResponse.json({ ...JSON.parse(content), source: "openai" });
  } catch {
    return NextResponse.json({ ...FALLBACK_COMPANION, source: "fallback" });
  }
}
