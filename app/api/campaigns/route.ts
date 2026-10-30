import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';
import { INITIAL_MARKETPLACE_CAMPAIGNS } from '@/lib/campaignStore';
import { auth } from '@/auth';

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
    const { title, total_budget, brand_id } = body;

    if (!title || typeof total_budget !== 'number' || total_budget <= 0) {
      return NextResponse.json(
        { success: false, error: 'Title and a valid total escrow budget are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // If brand user exists, ensure they hold the 'brand' role
    if (brand_id) {
      try {
        const brandUser = await User.findOne({ $or: [{ id: brand_id }, { _id: brand_id }] });
        if (brandUser && brandUser.role !== 'brand') {
          brandUser.role = 'brand';
          await brandUser.save();
        }
      } catch (err) {
        console.warn('Could not update brand role for user:', err);
      }
    }

    const campaignId = body.id || `camp-${Date.now()}`;

    // Upsert the campaign so if it already has an ID, it updates or creates cleanly
    const savedCamp = await CampaignModel.findOneAndUpdate(
      { id: campaignId },
      {
        ...body,
        id: campaignId,
        brand_id: body.brand_id || 'brand_default',
        brand_name: body.brand_name || 'Partner Brand',
        brand_logo: body.brand_logo || '⚡',
        title: title.trim(),
        total_budget,
        remaining_budget: body.remaining_budget ?? total_budget,
        execution_type: body.execution_type || 'cpm_pool',
        cpm_rate: body.cpm_rate ?? 0,
        max_payout_per_clip: body.max_payout_per_clip ?? 0,
        min_views_threshold: body.min_views_threshold ?? 0,
        asset_drive_link: body.asset_drive_link || '',
        platforms: Array.isArray(body.platforms) && body.platforms.length > 0 ? body.platforms : ['x', 'instagram', 'youtube_shorts'],
        category: body.category || 'DevTools',
        status: body.status || 'active',
        created_at: body.created_at || Date.now(),
        participants_count: body.participants_count ?? 0,
        total_views_tracked: body.total_views_tracked ?? 0,
        total_paid_out: body.total_paid_out ?? 0,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      campaign: savedCamp,
    });
  } catch (error: any) {
    console.error('Error creating campaign in MongoDB:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
