import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.SHEETS_SPREADSHEET_ID || '1Be3uWps2Y3DUaIIldVVvhHlThzt__dgw7pdaMb68AxU';

function getAuth() {
  if (!process.env.GOOGLE_CREDENTIALS) {
    throw new Error('GOOGLE_CREDENTIALS env not set');
  }
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

// Utility to ensure a header row exists (id | ...)
async function ensureHeader(tab: string, headers: string[]) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!1:1`,
  });
  const row = res.data.values?.[0] || [];
  if (row.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${tab}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }
}

function nowIso() {
  return new Date().toISOString();
}

function genId(prefix: string = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

// USERS
export async function upsertUser(email: string, name?: string) {
  const tab = 'Users';
  await ensureHeader(tab, ['id', 'email', 'name', 'createdAt']);
  const sheets = await getSheets();
  const get = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${tab}!A2:D` });
  const rows = get.data.values || [];
  const idx = rows.findIndex(r => (r[1] || '').toLowerCase() === email.toLowerCase());
  if (idx >= 0) return; // already exists
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!A:D`,
    valueInputOption: 'RAW',
    requestBody: { values: [[genId('user'), email, name || '', nowIso()]] },
  });
}

// LISTS
export interface ListRow { id: string; ownerEmail: string; name: string; isPublic: string; createdAt: string }
export async function createList(ownerEmail: string, name: string, isPublic: boolean) {
  const tab = 'Lists';
  await ensureHeader(tab, ['id', 'ownerEmail', 'name', 'isPublic', 'createdAt']);
  const id = genId('list');
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab}!A:E`,
    valueInputOption: 'RAW',
    requestBody: { values: [[id, ownerEmail, name, isPublic ? 'TRUE' : 'FALSE', nowIso()]] },
  });
  return id;
}

export async function getListsForPublicOrOwner(ownerEmail?: string) {
  const tab = 'Lists';
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${tab}!A2:E` });
  const rows: string[][] = res.data.values || [];
  const all = rows.map(r => ({ id: r[0], ownerEmail: r[1], name: r[2], isPublic: (r[3] || '').toUpperCase() === 'TRUE', createdAt: r[4] }));
  return all.filter(l => l.isPublic || (ownerEmail && l.ownerEmail?.toLowerCase() === ownerEmail.toLowerCase()));
}

export async function getListById(id: string) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `Lists!A2:E` });
  const rows: string[][] = res.data.values || [];
  const row = rows.find(r => r[0] === id);
  if (!row) return null;
  return { id: row[0], ownerEmail: row[1], name: row[2], isPublic: (row[3] || '').toUpperCase() === 'TRUE', createdAt: row[4] };
}

export async function deleteList(id: string, ownerEmail: string) {
  // Deleting arbitrary rows in Sheets requires batchUpdate. We'll mark as logically deleted by making it non-public and renaming.
  const list = await getListById(id);
  if (!list) return false;
  if (list.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) return false;
  const sheets = await getSheets();
  // Find row index
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `Lists!A2:E` });
  const rows: string[][] = res.data.values || [];
  const idx = rows.findIndex(r => r[0] === id);
  if (idx < 0) return false;
  const rowNumber = idx + 2; // because header is row 1
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Lists!A${rowNumber}:E${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[id, list.ownerEmail, `[DELETED] ${list.name}`, 'FALSE', list.createdAt]] },
  });
  return true;
}

// LIST ITEMS
export async function getItemsForList(listId: string) {
  await ensureHeader('ListItems', ['id', 'listId', 'companyId', 'createdAt']);
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `ListItems!A2:D` });
  const rows: string[][] = res.data.values || [];
  return rows.filter(r => r[1] === listId).map(r => ({ id: r[0], listId: r[1], companyId: r[2], createdAt: r[3] }));
}

export async function addItemToList(listId: string, companyId: string, ownerEmail: string) {
  const list = await getListById(listId);
  if (!list) throw new Error('List not found');
  if (list.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) throw new Error('Forbidden');
  // Ensure header exists before any reads/writes
  await ensureHeader('ListItems', ['id', 'listId', 'companyId', 'createdAt']);
  const existing = await getItemsForList(listId);
  if (existing.some(e => e.companyId === companyId)) return; // no duplicate
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `ListItems!A:D`,
    valueInputOption: 'RAW',
    requestBody: { values: [[genId('item'), listId, companyId, nowIso()]] },
  });
}

export async function removeItemFromList(listId: string, companyId: string, ownerEmail: string) {
  const list = await getListById(listId);
  if (!list) throw new Error('List not found');
  if (list.ownerEmail.toLowerCase() !== ownerEmail.toLowerCase()) throw new Error('Forbidden');
  const sheets = await getSheets();
  await ensureHeader('ListItems', ['id', 'listId', 'companyId', 'createdAt']);
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `ListItems!A2:D` });
  const rows: string[][] = res.data.values || [];
  const idx = rows.findIndex(r => r[1] === listId && r[2] === companyId);
  if (idx < 0) return;
  const rowNumber = idx + 2;
  // Overwrite row with blanks to "remove"
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `ListItems!A${rowNumber}:D${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['', '', '', '']] },
  });
}
