import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteList, getItemsForList, getListById } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const list = await getListById(params.id);
    if (!list) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const items = await getItemsForList(params.id);
    return NextResponse.json({ ...list, items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ok = await deleteList(params.id, session.user.email);
    if (!ok) return NextResponse.json({ error: 'Forbidden or not found' }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
