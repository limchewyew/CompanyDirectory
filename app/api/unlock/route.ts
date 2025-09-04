import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { unlockCompany, getUnlockedCompanies } from '@/lib/sheets';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { companyId } = await request.json();
    if (!companyId) {
      return new NextResponse(JSON.stringify({ error: 'Company ID is required' }), { status: 400 });
    }

    await unlockCompany(session.user.email, companyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlocking company:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to unlock company' }), { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const unlockedCompanies = await getUnlockedCompanies(session.user.email);
    return NextResponse.json({ unlockedCompanies });
  } catch (error) {
    console.error('Error fetching unlocked companies:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch unlocked companies' }), { status: 500 });
  }
}
