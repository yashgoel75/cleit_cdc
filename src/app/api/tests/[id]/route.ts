import { NextRequest, NextResponse } from "next/server";
import { Test } from "../../../../../db/schema";
import { register } from "@/instrumentation";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await register();
  const test = await Test.findById(params.id);
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }
  return NextResponse.json({ test });
}


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await register();

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const updatedTest = await Test.findByIdAndUpdate(
      id,
      { $addToSet: { studentsApplied: email } },
      { new: true }
    );

    if (!updatedTest) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    return NextResponse.json({ message: "Applied successfully", test: updatedTest });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
