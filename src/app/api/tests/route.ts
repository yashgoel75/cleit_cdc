import { NextResponse } from "next/server";
import { register } from "@/instrumentation";
import { Test } from "../../../../db/schema";

export async function GET() {
  try {
    await register();
    const tests = await Test.find().sort({ createdAt: -1 });
    return NextResponse.json({ tests });
  } catch (error) {
    console.error("GET /api/tests error:", error);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}