import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { removeItemFromList } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: { id: string, companyId: string } }) {
  try {
    const session = await getServerSession(authOptions as any);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await removeItemFromList(params.id, String(params.companyId), session.user.email);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
