import { getDb, Collections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditQuoteForm from "./EditQuoteForm"; // Yeni oluşturduğumuz formu içeri aktarıyoruz

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const quoteId = resolvedParams.id;

  // GÜVENLİK
  const session = await auth0.getSession();
  if (!session?.user) redirect("/auth/login");

  // VERİ ÇEKME
  const db = await getDb();
  const quote = await db
    .collection(Collections.quotes)
    .findOne({ _id: new ObjectId(quoteId) });

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-bold">
        Quote not found.
      </div>
    );
  }

  // YETKİ KONTROLÜ
  if (quote.createdBy !== session.user.sub) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-xl font-bold text-error">
          Unauthorized: You can only edit your own quotes.
        </p>
        <Link href="/" className="btn btn-primary">
          Go Back Home
        </Link>
      </div>
    );
  }

  // ÖN YÜZ
  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200 px-5">
      {/* Uzun HTML formunu sildik, yerine kendi oluşturduğumuz bileşeni çağırdık */}
      <EditQuoteForm 
        quoteId={quoteId} 
        defaultQuote={quote.quote} 
        defaultAuthor={quote.author} 
        defaultCategory={quote.category || []}
      />
    </main>
  );
}