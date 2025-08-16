import { NextResponse } from "next/server";
import { register } from "@/instrumentation";
import { Job } from "../../../../../db/schema";

export async function GET(req, { params }) {
  await register();
  const { id } = params;

  const job = await Job.findById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}

export async function PATCH(req, { params }) {
  await register();
  const { id } = params;
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const job = await Job.findByIdAndUpdate(
    id,
    { $addToSet: { studentsApplied: email } }, // avoids duplicates
    { new: true }
  );

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, job });
}
