import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Job } from "../../../../../db/schema";
import { register } from "@/instrumentation";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await register();
  const job = await Job.findById(params.id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ job });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await connectDB();

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $addToSet: { studentsApplied: email } },
      { new: true }
    );

    if (!updatedJob) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ message: "Applied successfully", job: updatedJob });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
