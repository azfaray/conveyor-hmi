'use server';

import { db } from '@/db';
import { conveyorLogs } from '@/db/schema';
import { desc, and, gte, lte } from 'drizzle-orm';

// 1. Fungsi Ambil Data (Yang sudah ada sebelumnya)
export async function getLatestData() {
  try {
    const data = await db
      .select()
      .from(conveyorLogs)
      .orderBy(desc(conveyorLogs.createdAt))
      .limit(1);
    
    return data[0] || null;
  } catch (error) {
    console.error('Failed to fetch latest data:', error);
    return null;
  }
}

// 2. Fungsi History (Untuk Chart nanti)
export async function getHistoryData(limit = 50) {
  try {
    const data = await db
      .select()
      .from(conveyorLogs)
      .orderBy(desc(conveyorLogs.createdAt))
      .limit(limit);
    
    return data.reverse();
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
}

// 3. Fungsi Kirim Perintah
// 3. Fungsi Kirim Perintah (DEPRECATED: Now using MQTT via Client)
export async function sendCommand(updates: any) {
  console.warn("sendCommand is deprecated. Use MQTT publish from client instead.");
  return { success: false, message: "Deprecated" };
  /*
  try {
    // Ambil state terakhir mesin biar data sensor lain gak hilang
    const latest = await getLatestData();
    
    if (!latest) return { success: false, message: "No data found" };

    // Insert baris baru: Data Lama + Update Baru dari Tombol
    await db.insert(conveyorLogs).values({
      ...latest,      // Copy semua field lama
      ...updates,     // Timpa field yang diubah
      id: undefined,  // Biar database generate ID baru
      createdAt: undefined // Biar database generate waktu baru
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send command:", error);
    return { success: false };
  }
  */
}

// FUNGSI BARU: Ambil data berdasarkan rentang waktu
export async function getFilteredLogs(startDate: Date, endDate: Date) {
  try {
    const data = await db
      .select()
      .from(conveyorLogs)
      .where(
        and(
          gte(conveyorLogs.createdAt, startDate), // Greater Than or Equal (>= Start)
          lte(conveyorLogs.createdAt, endDate)    // Less Than or Equal (<= End)
        )
      )
      .orderBy(desc(conveyorLogs.createdAt)); // Urutkan dari yang terbaru
    
    // Kita reverse biar di grafik urut dari Kiri (Lama) ke Kanan (Baru)
    return data.reverse();
  } catch (error) {
    console.error("Gagal filter data:", error);
    return [];
  }
}