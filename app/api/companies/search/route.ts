import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!process.env.GOOGLE_CREDENTIALS) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').toLowerCase().trim();
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 10));

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1Be3uWps2Y3DUaIIldVVvhHlThzt__dgw7pdaMb68AxU';
    const range = 'Database!A:O';
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = response.data.values;
    if (!rows || rows.length < 2) return NextResponse.json([]);

    const companies = rows.slice(1).map((row, idx) => ({
      id: idx + 1,
      name: row[0] || '',
      industry: row[3] || '',
      logo: row[14] || '',
    }));

    const results = !q
      ? companies.slice(0, limit)
      : companies.filter(c => c.name.toLowerCase().includes(q)).slice(0, limit);

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
