import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { checkAdminIp } from "@/lib/admin-auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Helper to check admin auth
async function verifyAdminAuth(req: NextRequest) {
  if (!checkAdminIp(req)) return false;
  
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback") as any;
    return decoded.admin === true;
  } catch (e) {
    return false;
  }
}

// GET: list pending creators
export async function GET(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await connectToDatabase();
  const pendingCreators = await User.find(
    { role: "creator", creatorStatus: "pending" },
    { profile: 1, handle: 1, email: 1, createdAt: 1 }
  ).sort({ createdAt: 1 }).lean();

  return NextResponse.json({ creators: pendingCreators });
}

// POST: Approve or Reject
export async function POST(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { creatorId, action, reason } = await req.json(); // action: "approve" or "reject"
  const adminId = process.env.ADMIN_ID || "system";

  await connectToDatabase();

  if (action === "approve") {
    await User.updateOne(
      { _id: creatorId, role: "creator", creatorStatus: "pending" },
      {
        $set: {
          creatorStatus: "approved",
          publicProfileEnabled: true,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          updatedAt: new Date()
        }
      }
    );
  } else if (action === "reject") {
    await User.updateOne(
      { _id: creatorId, role: "creator", creatorStatus: "pending" },
      {
        $set: {
          creatorStatus: "rejected",
          publicProfileEnabled: false,
          rejectionReason: reason || "Does not meet criteria",
          reviewedAt: new Date(),
          reviewedBy: adminId,
          updatedAt: new Date()
        }
      }
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
