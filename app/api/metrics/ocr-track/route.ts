import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import CampaignModel from '@/models/Campaign';
import User from '@/models/User';
import { capturePostScreenshot } from '@/lib/screenshotService';
import { runOcrOnImage } from '@/lib/ocrParser';
import { fetchLiveStats } from '@/lib/metrics';
import { calculateClipPayout, parseSocialUrl } from '@/lib/campaignUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, submissionId, uploadedImageBase64 } = body;

    if (!url && !uploadedImageBase64) {
      return NextResponse.json(
        { success: false, error: 'url or uploadedImageBase64 is required' },
        { status: 400 }
      );
    }

    let imageBuffer: Buffer | null = null;
    let screenshotUrl: string | undefined = undefined;

    // 1. Obtain image buffer either from direct upload or headless screenshot
    if (uploadedImageBase64) {
      const base64Data = uploadedImageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      screenshotUrl = uploadedImageBase64.startsWith('data:')
        ? uploadedImageBase64
        : `data:image/png;base64,${base64Data}`;
    } else if (url) {
      const snapResult = await capturePostScreenshot(url);
      if (snapResult.success && snapResult.imageBuffer) {
        imageBuffer = snapResult.imageBuffer;
        screenshotUrl = snapResult.screenshotUrl;
      }
    }

    // 2. Run OCR on the captured image
    let ocrResult: import('@/lib/ocrParser').OcrResult = {
      success: false,
      views: 0,
      confidence: 0,
      matchedSnippet: undefined,
      rawText: '',
      botBlocked: false,
      error: undefined,
    };

    if (imageBuffer) {
      ocrResult = await runOcrOnImage(imageBuffer);
    }

    let finalViews = ocrResult.views || 0;
    let detectionMethod = ocrResult.views > 0 ? 'OCR_SCREENSHOT' : 'FALLBACK';

    // 3. If OCR detected bot challenge or missed the views on headless screen,
    // query public syndication / oEmbed metadata as an intelligent safeguard
    if (finalViews === 0 && url) {
      const parsed = parseSocialUrl(url);
      if (parsed.isValid && parsed.platform && parsed.externalId) {
        const liveStats = await fetchLiveStats(parsed.platform, parsed.externalId);
        if (liveStats.views > 0) {
          finalViews = liveStats.views;
          detectionMethod = 'SYNDICATION_METADATA_FALLBACK';
        }
      }
    }

    // 4. If submissionId was passed, persist updated view count and recalculate bounty payout
    let updatedSub = null;
    if (submissionId) {
      await connectToDatabase();
      const sub = await SubmissionModel.findOne({ id: submissionId });

      if (sub) {
        const now = Date.now();
        const viewsToRecord = Math.max(sub.current_view_count, finalViews);

        const campaign = await CampaignModel.findOne({ id: sub.campaign_id });
        if (campaign) {
          const { payout } = calculateClipPayout({
            initialViews: sub.initial_view_count,
            currentViews: viewsToRecord,
            cpmRate: campaign.cpm_rate,
            maxPayoutPerClip: campaign.max_payout_per_clip,
            minViewsThreshold: campaign.min_views_threshold,
            campaignRemainingBudget: campaign.remaining_budget + sub.earned_amount,
          });

          const payoutDelta = payout - sub.earned_amount;
          const viewsDelta = viewsToRecord - sub.current_view_count;

          sub.current_view_count = viewsToRecord;
          sub.earned_amount = payout;
          sub.last_polled_at = now;
          if (ocrResult.matchedSnippet) {
            sub.ocr_snippet = ocrResult.matchedSnippet;
          }
          if (screenshotUrl && screenshotUrl.length < 500000) {
            sub.screenshot_url = screenshotUrl;
          }
          await sub.save();
          updatedSub = sub.toObject();

          // Update campaign totals in DB
          if (payoutDelta > 0 || viewsDelta > 0) {
            await CampaignModel.findOneAndUpdate(
              { id: sub.campaign_id },
              {
                $inc: {
                  remaining_budget: -payoutDelta,
                  total_views_tracked: viewsDelta,
                  total_paid_out: payoutDelta,
                },
              }
            );

            // Update user metrics
            await User.findOneAndUpdate(
              { $or: [{ id: sub.creator_id }, { email: sub.creator_id }] },
              {
                $inc: {
                  total_views_generated: viewsDelta,
                },
              }
            );
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      views: finalViews,
      detectionMethod,
      matchedSnippet: ocrResult.matchedSnippet,
      confidence: ocrResult.confidence,
      screenshotUrl,
      submission: updatedSub,
    });
  } catch (error: any) {
    console.error('OCR View Tracking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error during OCR view tracking' },
      { status: 500 }
    );
  }
}
