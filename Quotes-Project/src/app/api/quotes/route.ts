import { Collections, getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const db = await getDb();
    const col = db.collection(Collections.quotes);
    const query = { adminApproved: true };
    const quotes = await col.find(query).toArray();
    return NextResponse.json(quotes);
  } catch (error) {
    console.error("Veri çekilirken hata yaşandı:", error);
    return NextResponse.json(
      { error: "Veriler getirilemedi" },
      { status: 500 }
    );
  }
}