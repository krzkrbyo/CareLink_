import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient, hasOpenAI } from "@/lib/openai/client";
import { REMINDER_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { FALLBACK_REMINDERS } from "@/lib/demo-data/fallback-messages";

const schema = z.object({
  elderName: z.string(),
  type: z.string(),
  context: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    if (!hasOpenAI()) {
      const fallback = FALLBACK_REMINDERS[body.type] ?? FALLBACK_REMINDERS.medication;
      return NextResponse.json({ ...fallback, source: "fallback" });
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: REMINDER_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            elderName: body.elderName,
            type: body.type,
            context: body.context ?? {},
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response");

    const parsed = JSON.parse(content);
    return NextResponse.json({ ...parsed, source: "openai" });
  } catch (error) {
    const fallback = FALLBACK_REMINDERS.medication;
    return NextResponse.json({
      ...fallback,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
