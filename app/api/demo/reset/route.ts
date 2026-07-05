import { NextResponse } from "next/server";
import { resetDemoData } from "@/lib/demo-data/reset";

export async function GET() {
  try {
    await resetDemoData();
    return NextResponse.redirect(
      new URL("/cuidador/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reset failed" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await resetDemoData();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reset failed" },
      { status: 500 }
    );
  }
}
