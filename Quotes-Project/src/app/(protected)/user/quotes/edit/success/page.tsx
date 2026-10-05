"use client";

import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/Button";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Nav } from "@/components/nav";
import { Useravatar } from "@/components/Useravatar";
import { Main } from "@/components/Main";

const navLinkClass =
  "inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm";

export default function EditQuoteSuccessPage() {
  const { user, isLoading } = useUser();

  return (
    <Main variant="primary">
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          <Useravatar variant="primary" name={user?.name} picture={user?.picture} />

          {!isLoading && user && (
            <a href="/auth/logout" className={navLinkClass}>
              Log out
            </a>
          )}
        </div>

        <div>
          <ThemeSwitcher />
        </div>
      </Nav>
      <section className="bg-background rounded-md p-8 md:p-12 flex items-center flex-col shadow-xl border border-border">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-xl font-medium mb-4 text-foreground">
            Your quote was updated and sent to the administrator for review
            again. It will appear in quotes after it is approved.
          </h1>

          <Button variant="primary" asChild>
            <Link href="/">Go to homepage</Link>
          </Button>
        </div>
      </section>
    </Main>
  );
}
