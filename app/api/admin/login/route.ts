import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkAdminIp, generateAdminSessionToken } from "@/lib/admin-auth";
import { cookies } from "next/headers";

const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: NextRequest) {
  if (!checkAdminIp(req)) {
    return NextResponse.json({ error: "Forbidden IP" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const rl = rateLimits.get(ip);
  if (rl && rl.count >= 5 && rl.expiresAt > now) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  try {
    const { adminId, password } = await req.json();
    
    if (adminId !== process.env.ADMIN_ID) {
      rateLimits.set(ip, { count: (rl?.count || 0) + 1, expiresAt: now + 15 * 60 * 1000 });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const hash = process.env.ADMIN_PASSWORD_HASH || "";
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) {
      rateLimits.set(ip, { count: (rl?.count || 0) + 1, expiresAt: now + 15 * 60 * 1000 });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Success
    rateLimits.delete(ip);
    const token = generateAdminSessionToken(); // in real app, store token in DB/Redis or sign JWT with secret
    
    // We will just use a simple signed JWT or a fixed token if we don't have DB for admin sessions.
    // Let's use a signed JWT since we have NextAuth secret anyway.
    const jwt = require("jsonwebtoken");
    const sessionToken = jwt.sign({ admin: true }, process.env.NEXTAUTH_SECRET || "fallback", { expiresIn: "1d" });

    (await cookies()).set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin login error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
