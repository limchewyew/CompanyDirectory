import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Prevent static optimization

export async function GET() {
  // Load credentials from environment variable
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS!);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = '1Be3uWps2Y3DUaIIldVVvhHlThzt__dgw7pdaMb68AxU';
  const range = 'Database!A:O';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return NextResponse.json([]);
    }
    // First row is header, skip it
    const companies = rows.slice(1).map((row, idx) => ({
      id: idx + 1,
      name: row[0] || '',
      description: row[1] || '',
      country: row[2] || '',
      industry: row[3] || '',
      subIndustry: row[4] || '',
      yearFounded: row[5] || '',
      employees: row[6] || '',
      history: Number(row[7]) || 0,
      brandAwareness: Number(row[8]) || 0,
      moat: Number(row[9]) || 0,
      size: Number(row[10]) || 0,
      innovation: Number(row[11]) || 0,
      total: Number(row[12]) || 0,
      website: row[13] || '',
      logo: row[14] || ''
    }));
    return NextResponse.json(companies);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
