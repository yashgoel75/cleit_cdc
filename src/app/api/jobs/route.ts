import { NextResponse } from "next/server";
import { register } from "@/instrumentation";
import { Job } from "../../../../db/schema";

export async function GET() {
  try {
    await register();
    const jobs = await Job.find().sort({ createdAt: -1 });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}