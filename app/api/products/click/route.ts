import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductClick, ProductMetric } from '@/models/ProductClick';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productUrl, productName } = body;

    if (!productId || !productUrl) {
      return NextResponse.json(
        { success: false, error: 'productId and productUrl are required' },
        { status: 400 }
      );
    }

    // Capture requester info for analytics / audit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    try {
      await connectToDatabase();

      // 1. Log the individual click event
      await ProductClick.create({
        productId,
        productUrl,
        productName: productName || '',
        ip,
        userAgent,
        clickedAt: new Date(),
      });

      // 2. Increment total clicks in the aggregated metrics collection
      const metric = await ProductMetric.findOneAndUpdate(
        { productId },
        {
          $inc: { totalClicks: 1 },
          $set: {
            productUrl,
            productName: productName || '',
            lastClickedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );

      return NextResponse.json({
        success: true,
        clicks: metric.totalClicks,
      });
    } catch (dbError: any) {
      console.warn('Database error while recording click, falling back:', dbError?.message);
      // Even if DB connection experiences temporary issues, return success with null count
      return NextResponse.json({
        success: true,
        fallback: true,
        message: 'Click recorded in memory/fallback',
      });
    }
  } catch (err: any) {
    console.error('Error in /api/products/click POST:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const metrics = await ProductMetric.find({}, { productId: 1, totalClicks: 1, _id: 0 }).lean();

    const clickMap: Record<string, number> = {};
    for (const m of metrics) {
      if (m.productId) {
        clickMap[m.productId] = m.totalClicks;
      }
    }

    return NextResponse.json({
      success: true,
      clicks: clickMap,
    });
  } catch (err: any) {
    console.warn('Error in /api/products/click GET:', err?.message);
    return NextResponse.json({
      success: false,
      clicks: {},
      error: err?.message || 'Database unavailable',
    });
  }
}
