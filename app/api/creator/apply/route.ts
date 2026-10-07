import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      displayName, 
      handle, 
      niche, 
      bio, 
      country, 
      audienceSize, 
      contactEmail, 
      links, 
      sampleUrls, 
      proofUrl 
    } = body;

    // Validate handle format
    const normalizedHandle = handle?.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!normalizedHandle) {
      return NextResponse.json({ error: "Valid handle required" }, { status: 400 });
    }

    await connectToDatabase();

    const applicationFields = {
      displayName,
      niche,
      bio,
      country,
      audienceSize: Number(audienceSize) || 0,
      contactEmail: contactEmail || session.user.email,
      links: links || [],
      sampleUrls: sampleUrls || [],
      proofUrl
    };

    const result = await User.updateOne(
      { 
        email: session.user.email, 
        role: { $in: ["brand", "creator"] }, 
        creatorStatus: { $ne: "approved" } 
      },
      {
        $set: {
          role: "creator",
          creatorStatus: "pending",
          publicProfileEnabled: false,
          handle: normalizedHandle,
          profile: applicationFields,
          rejectionReason: null,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Could not update user. Either already approved or user not found." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Creator application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
