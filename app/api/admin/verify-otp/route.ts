import { NextRequest, NextResponse } from "next/server";
import { checkAdminIp } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminOtp from "@/models/AdminOtp";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const TARGET_ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";

const otpAttempts = new Map<string, { count: number; lockedUntil: number }>();

export async function POST(req: NextRequest) {
  if (!checkAdminIp(req)) {
    return NextResponse.json({ error: "Forbidden IP address" }, { status: 403 });
  }

  const clientIp = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const attemptInfo = otpAttempts.get(clientIp);

  if (attemptInfo && attemptInfo.count >= 5 && attemptInfo.lockedUntil > now) {
    return NextResponse.json(
      { error: "Too many failed attempts. OTP locked. Please request a new code." },
      { status: 429 }
    );
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
      const currentCount = (attemptInfo?.count || 0) + 1;
      otpAttempts.set(clientIp, { count: currentCount, lockedUntil: now + 15 * 60 * 1000 });

      // Invalidate active OTP if brute-force threshold reached
      if (currentCount >= 5) {
        await AdminOtp.deleteMany({ email: TARGET_ADMIN_EMAIL });
        return NextResponse.json(
          { error: "Max verification attempts exceeded. Code has been invalidated. Please generate a new OTP." },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: "Incorrect verification code. Please check your email and try again." }, { status: 400 });
    }

    // Success -> clear rate limit entry
    otpAttempts.delete(clientIp);

    if (new Date() > record.expiresAt) {
      await AdminOtp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    // Mark as verified & delete
    await AdminOtp.deleteOne({ _id: record._id });

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server authentication is not configured" }, { status: 500 });
    }

    // Issue signed Admin Session JWT cookie
    const sessionToken = jwt.sign(
      { admin: true, email: TARGET_ADMIN_EMAIL, verifiedAt: Date.now() },
      secret,
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
