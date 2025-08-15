import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const { folder, public_id } = await req.json();

  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign: Record<string, string | number | undefined> = {
    timestamp,
    folder: folder || "resumes",
    public_id: public_id || undefined,
  };

  const signature = crypto
    .createHash("sha1")
    .update(
      Object.keys(paramsToSign)
        .filter((key) => paramsToSign[key] !== undefined)
        .sort()
        .map((key) => `${key}=${paramsToSign[key]}`)
        .join("&") + process.env.CLOUDINARY_API_SECRET
    )
    .digest("hex");

  return NextResponse.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: folder || "resumes",
  });
}
