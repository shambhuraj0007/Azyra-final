import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SubmissionModel from '@/models/Submission';
import { auth } from '@/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    
    const existing = await SubmissionModel.findOne({ id });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    // Authorization: User must be the owner of the submission
    const isOwner =
      existing.creator_id === session.user.id ||
      existing.creator_id === session.user.email ||
      (session.user as any).role === 'admin';

    if (!isOwner) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this submission' }, { status: 403 });
    }

    await SubmissionModel.deleteOne({ id });
    return NextResponse.json({ success: true, message: 'Submission deleted' });
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
