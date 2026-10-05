"use client";
import { Nav } from "@/components/nav";
import { Useravatar } from "@/components/Useravatar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/Button";
import { Main } from "@/components/Main";
import { QuoteForm } from "@/components/QuoteForm";
import { addNewQuote } from "./action";
import { useUser } from "@auth0/nextjs-auth0/client";

const navLinkClass =
  "inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm";

export default function AddNewQuotePage() {
  const { user, isLoading } = useUser();

  return (
    <Main variant="primary">
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          <Useravatar variant="primary" name={user?.name} picture={user?.picture} />

          {!isLoading && user && (
            <>
              <a href="/auth/logout" className={navLinkClass}>
                Log out
              </a>
              <a href="/" className={navLinkClass}>
                Homepage
              </a>
            </>
          )}
        </div>

        <div>
          <ThemeSwitcher />
        </div>
      </Nav>

      <div className="w-full max-w-lg px-5 flex flex-col items-center gap-5 mt-20">
        <QuoteForm
          action={addNewQuote}
          submitLabel="Create"
          successHref="/user/quotes/new/success"
          secondary={
            <Button variant="primary" type="reset">
              Clear
            </Button>
          }
        />
      </div>
    </Main>
  );
}
