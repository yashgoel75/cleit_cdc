import { NextRequest, NextResponse } from "next/server";
import { User } from "../../../../../db/schema";
import { register } from "@/instrumentation";

export async function GET(req: NextRequest) {
    try {
        await register();
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");
        const email = searchParams.get("email");

        if (email) {
            const UserEmailExists = await User.findOne({ collegeEmail: email });

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
    enrollmentNumber: number,
    collegeEmail: string,
    phone: number,
    department: string,
    tenthPercentage: number,
    twelfthPercentage: number,
    collegeGPA: number,
    batchStart: number,
    batchEnd: number,
    linkedin: string,
    github: string,
    leetcode: string,
    status: string,
}
export async function POST(req: NextRequest) {
    const { name, username, enrollmentNumber, collegeEmail, phone, department, tenthPercentage, twelfthPercentage, collegeGPA, batchStart, batchEnd, linkedin, github, leetcode, status } = (await req.json()) as User;
    try {
        await register();
        if (!name || !username || !enrollmentNumber || !collegeEmail || !phone || !department || !tenthPercentage || !twelfthPercentage || !collegeGPA || !batchStart || !batchEnd || !linkedin || !github || !leetcode || !status) {
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
            enrollmentNumber,
            collegeEmail,
            personalEmail: "",
            phone,
            department,
            tenthPercentage,
            twelfthPercentage,
            collegeGPA,
            batchStart,
            batchEnd,
            linkedin,
            github,
            leetcode,
            resume: "",
            status,
            wishlist: [],
            reminders: [],
        });

        console.log(user);
    } catch (e) {
        NextResponse.json("Error!");
    }

    return NextResponse.json({ ok: true });
}