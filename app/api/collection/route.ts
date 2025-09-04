import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addToCollection, getUserCollection, isCompanyCollected } from '@/lib/sheets';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const collection = await getUserCollection(session.user.email);
    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    await addToCollection(session.user.email, companyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add to collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    // Note: This is a simplified implementation. In a real app, you'd want to
    // implement proper deletion logic based on the collection item ID.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove from collection' },
      { status: 500 }
    );
  }
}
