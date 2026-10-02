import { getDb, Collections } from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { QuoteForm } from "@/components/QuoteForm";
import { updateQuote } from "./action";
import { Nav } from "@/components/nav";
import { Useravatar } from "@/components/Useravatar";
import { Main } from "@/components/Main";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const navLinkClass =
  "inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm";

function EditNav({
  user,
}: {
  user: { name?: string | null; picture?: string | null };
}) {
  return (
    <Nav variant="primary">
      <div className="flex items-center gap-4">
        <Useravatar variant="primary" name={user.name} picture={user.picture} />
        <a href="/auth/logout" className={navLinkClass}>
          Log out
        </a>
        <Link href="/" className={navLinkClass}>
          Homepage
        </Link>
      </div>
      <div>
        <ThemeSwitcher />
      </div>
    </Nav>
  );
}

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const quoteId = resolvedParams.id;

  const session = await auth0.getSession();
  if (!session?.user) redirect("/auth/login");

  const user = session.user;
  const db = await getDb();
  const quote = await db
    .collection(Collections.quotes)
    .findOne({ _id: new ObjectId(quoteId) });

  if (!quote) {
    return (
      <Main variant="primary">
        <EditNav user={user} />
        <p className="text-xl font-bold text-foreground">Quote not found.</p>
      </Main>
    );
  }

  if (quote.createdBy !== user.sub) {
    return (
      <Main variant="primary">
        <EditNav user={user} />
        <div className="flex flex-col items-center gap-4 px-5">
          <p className="text-xl font-bold text-danger">
            Unauthorized: You can only edit your own quotes.
          </p>
          <Link href="/" className={navLinkClass}>
            Go Back Home
          </Link>
        </div>
      </Main>
    );
  }

  return (
    <Main variant="primary">
      <EditNav user={user} />
      <div className="w-full px-5 flex justify-center">
        <QuoteForm
          action={updateQuote.bind(null, quoteId)}
          defaultQuote={String(quote.quote ?? "")}
          defaultAuthor={String(quote.author ?? "")}
          defaultCategory={
            Array.isArray(quote.category)
              ? quote.category.map(String)
              : typeof quote.category === "string"
                ? quote.category
                : []
          }
          submitLabel="Save Changes"
          secondary={
            <Link
              href="/"
              className="mt-1 flex items-center justify-center rounded-md bg-slate-300/90 py-2 text-sm font-semibold text-slate-700 transition-colors hover:opacity-70"
            >
              Cancel
            </Link>
          }
        />
      </div>
    </Main>
  );
}
