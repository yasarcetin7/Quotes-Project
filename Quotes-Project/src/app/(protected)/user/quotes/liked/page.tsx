import { Button } from "@/components/Button";
import { H3 } from "@/typography/H3";
import { QuoteCard } from "@/components/QuoteCard";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Nav } from "@/components/nav";
import { Useravatar } from "@/components/Useravatar";
import { Main } from "@/components/Main";
import { auth0 } from "@/lib/auth0";
import { getDb, Collections } from "@/lib/db";
import { redirect } from "next/navigation";
import { toggleLikeQuote } from "./action";

const navLinkClass =
  "inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm";

export default async function LikedQuotesPage() {
  const session = await auth0.getSession();
  if (!session?.user) redirect("/auth/login");

  const user = session.user;
  const db = await getDb();
  const likedQuotes = await db
    .collection(Collections.quotes)
    .find({ adminApproved: true, likedBy: user.sub })
    .toArray();

  return (
    <Main variant="primary">
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          <Useravatar variant="primary" name={user?.name} picture={user?.picture} />

          <a
            href="/auth/logout"
            className={navLinkClass}
          >
            Log Out
          </a>
          <a
            href="/user/quotes/new"
            className={navLinkClass}
          >
            Add Quote
          </a>
          <a
            href="/"
            className={navLinkClass}
          >
            Homepage
          </a>
        </div>

        <div>
          <ThemeSwitcher />
        </div>
      </Nav>

      <div className="w-full max-w-lg px-4 flex flex-col items-center gap-4 mt-24">
        <div className="font-medium text-foreground w-full text-center mt-2 mb-1 border border-border">
          <H3 element="p">Liked Quotes</H3>
        </div>

        {likedQuotes.length === 0 ? (
          <p className="text-muted text-lg text-center bg-background w-full p-8 rounded-md shadow-xl border border-border">
            You haven't liked any of the quotes yet.
          </p>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {likedQuotes.map((item) => {
              const quoteId = item._id.toString();
              const removeLike = toggleLikeQuote.bind(null, quoteId);

              return (
                <QuoteCard
                  key={quoteId}
                  quote={String(item.quote ?? "")}
                  author={String(item.author ?? "")}
                  category={item.category}
                  action={
                    <form action={removeLike} className="flex items-center gap-3">
                      <span className="font-medium text-muted text-sm md:text-base mt-[2px]">
                        Remove from list :
                      </span>
                      <Button
                        variant="secondary"
                        type="submit"
                        aria-label="Remove quote from liked list"
                      >
                        💔
                      </Button>
                    </form>
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </Main>
  );
}