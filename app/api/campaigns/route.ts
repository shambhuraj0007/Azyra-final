import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';
import { INITIAL_MARKETPLACE_CAMPAIGNS } from '@/lib/campaignStore';

export async function GET() {
  try {
    await connectToDatabase();

    let campaigns = await CampaignModel.find({}).sort({ created_at: -1 }).lean();

    // If database has no campaigns yet, seed them from initial data
    if (!campaigns || campaigns.length === 0) {
      await CampaignModel.insertMany(INITIAL_MARKETPLACE_CAMPAIGNS);
      campaigns = await CampaignModel.find({}).sort({ created_at: -1 }).lean();
    }

    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (error: any) {
    console.error('Error fetching campaigns from MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database error fetching campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, total_budget, cpm_rate, asset_drive_link, brand_id } = body;

    if (!title || !total_budget || !cpm_rate || !asset_drive_link) {
      return NextResponse.json(
        { success: false, error: 'Title, budget, CPM rate, and asset link are required.' },
        { status: 400 }
      );
    }

    if (total_budget < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum campaign escrow budget is $100.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Access Control Check: Brand authorization
    if (brand_id) {
      const brandUser = await User.findOne({ $or: [{ id: brand_id }, { _id: brand_id }] });
      if (brandUser && brandUser.role !== 'brand') {
        return NextResponse.json(
          { success: false, error: 'Access denied: Only brand accounts can fund and launch campaigns.' },
          { status: 403 }
        );
      }
    }

    const newCamp = new CampaignModel({
      ...body,
      id: body.id || `camp-${Date.now()}`,
      created_at: Date.now(),
      participants_count: 0,
      total_views_tracked: 0,
      total_paid_out: 0,
      status: 'active',
    });

    await newCamp.save();

    return NextResponse.json({
      success: true,
      campaign: newCamp,
    });
  } catch (error: any) {
    console.error('Error creating campaign in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
