import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: Request) {
  try {
    const dbPath = path.join(process.cwd(), 'local_history.db');
    
    // Connect in Read-Only mode
    const db = new Database(dbPath, { readonly: true });

    // Fetch last 100 logs
    const rows = db.prepare('SELECT * FROM sensor_logs ORDER BY timestamp DESC LIMIT 100').all();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
  }
}