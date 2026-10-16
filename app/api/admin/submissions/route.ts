import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SubmissionModel from "@/models/Submission";
import { checkAdminIp } from "@/lib/admin-auth";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

// Helper to check admin auth
async function verifyAdminAuth(req: NextRequest) {
  if (!checkAdminIp(req)) return false;
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback_secret_xyz");
    const { payload: decoded } = await jwtVerify(token, secret);
    return decoded.admin === true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "verifying";

    const filter: any = {};
    if (status !== "all") {
      filter.verification_status = status;
    }

    const submissions = await SubmissionModel.find(filter)
      .sort({ submitted_at: -1 })
      .lean();

    const counts = {
      verifying: await SubmissionModel.countDocuments({ verification_status: "verifying" }),
      active: await SubmissionModel.countDocuments({ verification_status: "active" }),
      flagged_bot: await SubmissionModel.countDocuments({ verification_status: "flagged_bot" }),
      paid: await SubmissionModel.countDocuments({ verification_status: "paid" }),
      all: await SubmissionModel.countDocuments({}),
    };

    return NextResponse.json({ submissions, counts });
  } catch (error: any) {
    console.error("Admin submissions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminAuth(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { submissionId, action, reason } = await req.json();
    if (!submissionId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const submission = await SubmissionModel.findOne({ id: submissionId });
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    let newStatus = submission.verification_status;
    if (action === "approve") {
      newStatus = "active";
    } else if (action === "flag") {
      newStatus = "flagged_bot";
    } else if (action === "pay") {
      newStatus = "paid";
    }

    submission.verification_status = newStatus;
    // We could store the reason somewhere if added to the model, or ignore for now
    await submission.save();

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("Admin submission update error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
