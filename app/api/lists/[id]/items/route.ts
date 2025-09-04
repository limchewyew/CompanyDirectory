import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addItemToList, getItemsForList, getListById } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const list = await getListById(params.id);
    
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    
    // Check if list is public or user is the owner
    if (!list.isPublic && (!session?.user?.email || list.ownerEmail.toLowerCase() !== session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const items = await getItemsForList(params.id);
    return NextResponse.json(items);
    
  } catch (e: any) {
    console.error('Error fetching list items:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to fetch list items' }, 
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { companyId } = await req.json();
    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }
    
    await addItemToList(params.id, String(companyId), session.user.email);
    
    // Revalidate the list page to show updated items
    const revalidatePath = `/lists/${params.id}`;
    return NextResponse.json(
      { ok: true },
      { 
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
    
  } catch (e: any) {
    console.error('Error adding item to list:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to add item to list' },
      { status: 500 }
    );
  }
}
