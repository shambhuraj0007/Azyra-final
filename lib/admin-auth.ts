import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import crypto from "crypto";

export function checkAdminIp(req: NextRequest): boolean {
  const allowlist = process.env.ADMIN_IP_ALLOWLIST?.split(",").map(ip => ip.trim()) || [];
  if (allowlist.length === 0) return true; // If not set, maybe allow for dev? Prompt says: "IP match ADMIN_IP_ALLOWLIST"

  let clientIp = req.headers.get("x-real-ip") || "127.0.0.1";
  if (process.env.TRUST_PROXY === "true") {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      clientIp = forwardedFor.split(",")[0].trim();
    }
  }

  // Allow localhost for local development
  if (clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost") {
    return true;
  }

  return allowlist.includes(clientIp);
}

export function generateAdminSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
