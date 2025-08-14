import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addItemToList } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { companyId } = await req.json();
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    await addItemToList(params.id, String(companyId), session.user.email);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
