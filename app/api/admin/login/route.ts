import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { checkAdminIp } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminOtp from "@/models/AdminOtp";
import { sendAdminOtpEmail } from "@/lib/admin-mailer";

const rateLimits = new Map<string, { count: number; expiresAt: number }>();

// Helper to read latest values directly from .env file in real-time
function getLiveEnv(key: string, fallback: string = ""): string {
  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch (e) {}
  return (process.env[key] || fallback).trim();
}

export async function POST(req: NextRequest) {
  if (!checkAdminIp(req)) {
    return NextResponse.json({ error: "Forbidden IP address" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const rl = rateLimits.get(ip);
  if (rl && rl.count >= 5 && rl.expiresAt > now) {
    return NextResponse.json({ error: "Too many login attempts. Please wait 15 minutes." }, { status: 429 });
  }

  try {
    const { adminId, password } = await req.json();

    if (!adminId || !password) {
      return NextResponse.json({ error: "Admin credentials required" }, { status: 400 });
    }

    // Always fetch directly according to .env
    const targetAdminId = getLiveEnv("ADMIN_ID", "admin_azyra");
    const targetEmail = getLiveEnv("ADMIN_NOTIFICATION_EMAIL", "gadhaveshambhuraj@gmail.com");
    const envPlainPassword = getLiveEnv("ADMIN_PASSWORD", "");
    const hash = getLiveEnv("ADMIN_PASSWORD_HASH", "");

    if (adminId.trim() !== targetAdminId) {
      rateLimits.set(ip, { count: (rl?.count || 0) + 1, expiresAt: now + 15 * 60 * 1000 });
      return NextResponse.json({ error: "Invalid Admin ID" }, { status: 401 });
    }

    let isValid = false;
    // 1. Matches exact plain password in .env
    if (envPlainPassword && password.trim() === envPlainPassword.trim()) {
      isValid = true;
    }
    // 2. Matches bcrypt hash in .env
    else if (hash) {
      try {
        isValid = await bcrypt.compare(password.trim(), hash);
      } catch (e) {
        isValid = false;
      }
    }
    // 3. Fallback default
    else if (password.trim() === "Admin@Azyra2026" || password.trim() === "Admin@Azyra2026!") {
      isValid = true;
    }

    if (!isValid) {
      rateLimits.set(ip, { count: (rl?.count || 0) + 1, expiresAt: now + 15 * 60 * 1000 });
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Credentials valid -> Generate 6-digit OTP
    rateLimits.delete(ip);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await connectToDatabase();

    // Delete any old unverified OTPs for this email
    await AdminOtp.deleteMany({ email: targetEmail });

    // Store new OTP with 10-minute validity
    await AdminOtp.create({
      email: targetEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
    });

    // Send email to targetEmail from .env
    await sendAdminOtpEmail(otp, targetEmail);

    return NextResponse.json({
      success: true,
      requiresOtp: true,
      email: targetEmail,
      message: `2FA security code dispatched to ${targetEmail}`,
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
