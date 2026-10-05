import { Collections, getDb } from '@/lib/db';
import { NextResponse } from 'next/server';


// 1. "default" kelimesi kaldırıldı, sadece "export async function GET" kaldı.

export const dynamic = "force-dynamic";

// 2. NextApiRequest ve NextApiResponse yerine standart Request tipini kullanıyoruz.
export async function GET(request: Request) {
  try {
    const db = await getDb();
    const col = db.collection(Collections.quotes);
    
    // adminApproved: false olanları çekiyorsun
    const query = { adminApproved: true }; 
    const quotes = await col.find(query).toArray();
    
    // 3. Yeni sistemde veriyi NextResponse ile geri döndürüyoruz.
    // Frontend tarafında setQuotes(data) yaptığın için doğrudan diziyi (quotes) gönderiyoruz.
    return NextResponse.json(quotes);

  } catch (error) {
    console.error("Veri çekilirken hata yaşandı:", error);
    return NextResponse.json(
      { error: "Veriler getirilemedi" },
      { status: 500 }
    );
  }
}