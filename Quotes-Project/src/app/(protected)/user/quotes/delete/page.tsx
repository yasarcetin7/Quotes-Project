import Link from "next/link";
import { ObjectId } from "mongodb";
import { auth0 } from "@/lib/auth0";
import { Collections, getDb } from "@/lib/db";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/Button";
import { Nav } from "@/components/nav";
import { Useravatar } from "@/components/Useravatar";
import { Main } from "@/components/Main";
import { deleteQuoteAction } from "./action";

const navLinkClass =
  "inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm";

export default async function DeleteQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const session = await auth0.getSession();
  const user = session?.user;
  const rawId = (await searchParams).id;
  const quoteId = Array.isArray(rawId) ? rawId[0] : rawId;

  const quote =
    user && quoteId && ObjectId.isValid(quoteId)
      ? await (await getDb())
          .collection(Collections.quotes)
          .findOne({
            _id: new ObjectId(quoteId),
            createdBy: user.sub,
          })
      : null;

  return (
    <Main variant="primary">
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          <Useravatar variant="primary" name={user?.name} picture={user?.picture} />
          <a href="/auth/logout" className={navLinkClass}>
            Log out
          </a>
        </div>
        <div>
          <ThemeSwitcher />
        </div>
      </Nav>

      <section className="bg-background rounded-md p-8 md:p-12 flex w-full max-w-lg flex-col items-center shadow-xl border border-border">
        <div className="w-full text-center">
          {quote ? (
            <>
              <h1 className="text-xl font-medium mb-4 text-foreground">
                &quot;{String(quote.quote ?? "")}&quot; The entry is being deleted. Do you confirm?
              </h1>
              <form
                action={deleteQuoteAction}
                className="flex w-full flex-row items-stretch gap-2"
              >
                <input type="hidden" name="quoteId" value={quoteId} />
                <Button variant="primary" type="submit" className="mx-0 w-full flex-1">
                  Confirm
                </Button>
                <Button variant="primary" asChild className="mx-0 w-full flex-1">
                  <Link href="/" className="w-full">
                    Cancel
                  </Link>
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-medium text-foreground">
                Quote not found.
              </h1>
              <Button variant="primary" asChild>
                <Link href="/">Go to homepage</Link>
              </Button>
            </>
          )}
        </div>
      </section>
    </Main>
  );
}
