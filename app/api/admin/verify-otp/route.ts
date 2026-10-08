import { NextRequest, NextResponse } from "next/server";
import { checkAdminIp } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminOtp from "@/models/AdminOtp";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const TARGET_ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "gadhaveshambhuraj@gmail.com";

export async function POST(req: NextRequest) {
  if (!checkAdminIp(req)) {
    return NextResponse.json({ error: "Forbidden IP address" }, { status: 403 });
  }

  try {
    const { otp } = await req.json();

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json({ error: "Please enter a valid 6-digit verification code" }, { status: 400 });
    }

    await connectToDatabase();

    const record = await AdminOtp.findOne({
      email: TARGET_ADMIN_EMAIL,
      otp: otp.trim(),
      verified: false,
    });

    if (!record) {
      return NextResponse.json({ error: "Incorrect verification code. Please check your email and try again." }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      await AdminOtp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Mark as verified & delete
    await AdminOtp.deleteOne({ _id: record._id });

    // Issue signed Admin Session JWT cookie
    const sessionToken = jwt.sign(
      { admin: true, email: TARGET_ADMIN_EMAIL, verifiedAt: Date.now() },
      process.env.NEXTAUTH_SECRET || "fallback_secret_azyra_2026",
      { expiresIn: "1d" }
    );

    (await cookies()).set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json({
      success: true,
      message: "2FA authentication successful. Access granted.",
    });
  } catch (error: any) {
    console.error("Admin OTP verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
