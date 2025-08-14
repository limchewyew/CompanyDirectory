import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createList, getListsForPublicOrOwner } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const email = session?.user?.email || undefined;
    const lists = await getListsForPublicOrOwner(email);
    return NextResponse.json(lists);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { name, isPublic } = await req.json();
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    const id = await createList(session.user.email, name, Boolean(isPublic));
    return NextResponse.json({ id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
