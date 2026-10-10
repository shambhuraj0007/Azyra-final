import { NextRequest, NextResponse } from "next/server";
import { checkAdminIp } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/mongodb";
import AdminOtp from "@/models/AdminOtp";
import { sendAdminOtpEmail } from "@/lib/admin-mailer";

const TARGET_ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";
const resendRateLimit = new Map<string, number>();

export async function POST(req: NextRequest) {
  if (!checkAdminIp(req)) {
    return NextResponse.json({ error: "Forbidden IP address" }, { status: 403 });
  }

  const now = Date.now();
  const lastSent = resendRateLimit.get(TARGET_ADMIN_EMAIL) || 0;
  if (now - lastSent < 30000) {
    const waitSeconds = Math.ceil((30000 - (now - lastSent)) / 1000);
    return NextResponse.json({ error: `Please wait ${waitSeconds}s before requesting a new code.` }, { status: 429 });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await connectToDatabase();
    await AdminOtp.deleteMany({ email: TARGET_ADMIN_EMAIL });

    await AdminOtp.create({
      email: TARGET_ADMIN_EMAIL,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
    });

    resendRateLimit.set(TARGET_ADMIN_EMAIL, now);
    await sendAdminOtpEmail(otp, TARGET_ADMIN_EMAIL);

    return NextResponse.json({
      success: true,
      message: `New code sent to ${TARGET_ADMIN_EMAIL}`,
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Failed to resend code" }, { status: 500 });
  }
}
