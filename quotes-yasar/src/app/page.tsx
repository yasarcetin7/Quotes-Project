import { Collections, getDb } from "@/lib/db";
import { Main } from "@/components/Main";
import HomeQuotes, { type HomeQuoteData } from "./HomeQuotes";

export const dynamic = "force-dynamic";

const QUOTE_CATEGORIES = ["life", "health", "motivation", "wisdom"] as const;

type QuoteCategory = (typeof QUOTE_CATEGORIES)[number];

function selectedCategory(
  value: string | string[] | undefined,
): QuoteCategory | "all" {
  const raw = (Array.isArray(value) ? value[0] : value)?.toLowerCase();

  if (raw && (QUOTE_CATEGORIES as readonly string[]).includes(raw)) {
    return raw as QuoteCategory;
  }

  return "all";
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const category = selectedCategory((await searchParams).category);

  try {
    const db = await getDb();
    const docs = await db
      .collection(Collections.quotes)
      .find(
        category === "all"
          ? { adminApproved: true }
          : {
              adminApproved: true,
              category: { $regex: `^${category}$`, $options: "i" },
            },
      )
      .toArray();

    const quotes: HomeQuoteData[] = docs.map((doc) => {
      const likedBy = toStringList(doc.likedBy);

      return {
        _id: doc._id.toString(),
        quote: String(doc.quote ?? ""),
        author: String(doc.author ?? ""),
        category: toStringList(doc.category),
        likeCount:
          typeof doc.likeCount === "number" ? doc.likeCount : likedBy.length,
        likedBy,
        createdBy: String(doc.createdBy ?? ""),
      };
    });

    return (
      <HomeQuotes key={category} initialQuotes={quotes} category={category} />
    );
  } catch (error) {
    console.error("Veri çekilirken hata:", error);

    return (
      <Main variant="primary">
        <p className="text-xl font-semibold text-danger">
          Error: Don&apos;t loading quotes
        </p>
      </Main>
    );
  }
}
