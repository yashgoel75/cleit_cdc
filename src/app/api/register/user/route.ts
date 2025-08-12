import { NextRequest, NextResponse } from "next/server";
import { User } from "../../../../../db/schema";
import argon2 from "argon2";
import { register } from "@/instrumentation";

export async function GET(req: NextRequest) {
    try {
        await register();
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");
        const email = searchParams.get("email");

        if (email) {
            const UserEmailExists = await User.findOne({ email });

            return NextResponse.json({
                emailExists: !!(UserEmailExists),
            });
        }

        if (username) {
            const userUsernameExists = await User.findOne({ username });

            return NextResponse.json({
                usernameExists: !!(userUsernameExists),
            });
        }

        return NextResponse.json(
            { error: "Please provide 'username' or 'email' to check." },
            { status: 400 }
        );
    } catch (e) {
        console.error("Validation error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
interface User {
    name: string,
    username: string,
    collegeEmail: string,
    password: string
}
export async function POST(req: NextRequest) {
    const { name, username, collegeEmail, password } = (await req.json()) as User;
    try {
        await register();
        if (!name || !username || !collegeEmail || !password) {
            console.error("Missing entries");
            return NextResponse.json("Invalid Entry");
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(collegeEmail)) {
            return NextResponse.json("Invalid Email Format!");
        }

        const user = await User.create({
            name,
            username,
            collegeEmail,
            personalEmail: "",
            branch: "",
            linkedin: "",
            github: "",
            leetcode: "",
            resume: "",
            status: "Unplaced",
            wishlist: [],
            reminders: [],
        });

        console.log(user);
    } catch (e) {
        NextResponse.json("Error!");
    }

    return NextResponse.json({ ok: true });
}