import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import cloudinary from '@/lib/cloudinary';

// Max file size: 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please sign in to upload a profile picture.' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email.toLowerCase().trim();

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const base64Data = formData.get('image') as string | null;

    let buffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Image size exceeds maximum limit of 5MB.' },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file format. Allowed types: JPG, PNG, WEBP, GIF, SVG.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimeType = file.type;
    } else if (base64Data && typeof base64Data === 'string') {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Image size exceeds maximum limit of 5MB.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'No image file provided in request.' },
        { status: 400 }
      );
    }

    // 3. Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'azyra_profile_pictures',
            resource_type: 'image',
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
            public_id: `avatar_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
          },
          (error, result) => {
            if (error || !result) {
              console.error('[Cloudinary] Upload failed:', error);
              return reject(new Error(error?.message || 'Cloudinary upload failed'));
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        uploadStream.end(buffer);
      }
    );

    // 4. Save Cloudinary URI directly into MongoDB User record
    await connectToDatabase();

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          avatar: uploadResult.secure_url,
          image: uploadResult.secure_url,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile picture successfully stored on Cloudinary and saved to database.',
      url: uploadResult.secure_url,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        image: updatedUser.image,
      },
    });
  } catch (error: any) {
    console.error('[Upload Avatar] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload profile picture to Cloudinary.',
      },
      { status: 500 }
    );
  }
}
