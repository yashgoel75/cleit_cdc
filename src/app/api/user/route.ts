import { NextRequest, NextResponse } from "next/server";
import { User } from "../../../../db/schema";
import { register } from "@/instrumentation";

export async function GET(req: NextRequest) {
    try {
        await register();
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");
        const email = searchParams.get("email");

        if (!username && !email) {
            return NextResponse.json(
                { error: "Please provide 'username' or 'email' to check." },
                { status: 400 }
            );
        }
        const user = await User.findOne({ collegeEmail: email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ user }, { status: 200 });
    } catch (e) {
        console.error("Validation error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
