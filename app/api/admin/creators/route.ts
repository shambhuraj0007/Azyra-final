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
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return false;
    const decoded = jwt.verify(token, secret) as any;
    return decoded.admin === true;
  } catch (e) {
    return false;
  }
}

// GET: list creators with filtering and counts
export async function GET(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "pending"; // "pending" | "approved" | "rejected" | "all"

  await connectToDatabase();

  const query: any = { role: "creator" };
  if (statusFilter !== "all") {
    query.creatorStatus = statusFilter;
  }

  const creators = await User.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    User.countDocuments({ role: "creator", creatorStatus: "pending" }),
    User.countDocuments({ role: "creator", creatorStatus: "approved" }),
    User.countDocuments({ role: "creator", creatorStatus: "rejected" }),
  ]);

  return NextResponse.json({
    creators,
    counts: {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      all: pendingCount + approvedCount + rejectedCount,
    },
  });
}

// POST: Approve or Reject
export async function POST(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { creatorId, action, reason } = await req.json(); // action: "approve" | "reject" | "pending"
  const adminId = process.env.ADMIN_ID;

  await connectToDatabase();

  if (action === "approve") {
    await User.updateOne(
      { _id: creatorId, role: "creator" },
      {
        $set: {
          creatorStatus: "approved",
          isProfileSetup: true,
          publicProfileEnabled: true,
          rejectionReason: null,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          updatedAt: new Date(),
        },
      }
    );
  } else if (action === "reject") {
    await User.updateOne(
      { _id: creatorId, role: "creator" },
      {
        $set: {
          creatorStatus: "rejected",
          publicProfileEnabled: false,
          rejectionReason: reason || "Does not meet verification criteria",
          reviewedAt: new Date(),
          reviewedBy: adminId,
          updatedAt: new Date(),
        },
      }
    );
  } else if (action === "pending") {
    await User.updateOne(
      { _id: creatorId, role: "creator" },
      {
        $set: {
          creatorStatus: "pending",
          reviewedAt: null,
          reviewedBy: null,
          updatedAt: new Date(),
        },
      }
    );
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
