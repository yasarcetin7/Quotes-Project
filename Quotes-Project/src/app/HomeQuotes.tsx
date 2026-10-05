"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toggleLikeQuote } from "@/app/(protected)/user/quotes/liked/action";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Useravatar } from "@/components/Useravatar";
import { Main } from "@/components/Main";
import { QuoteCard } from "@/components/QuoteCard";
import { getRandomNumber } from "@/utils/helperfunctions";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All quotes" },
  { value: "life", label: "Life" },
  { value: "health", label: "Health" },
  { value: "motivation", label: "Motivation" },
  { value: "wisdom", label: "Wisdom" },
] as const;

export type HomeCategory = (typeof CATEGORY_OPTIONS)[number]["value"];

const navLinkClass =
  "inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm";

export type HomeQuoteData = {
  _id: string;
  quote: string;
  author: string;
  category: string[];
  likeCount: number;
  likedBy: string[];
  createdBy: string;
};

export default function HomeQuotes({
  initialQuotes,
  category,
}: {
  initialQuotes: HomeQuoteData[];
  category: HomeCategory;
}) {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const handleCategoryChange = (value: string) => {
    router.push(value === "all" ? "/" : `/?category=${value}`);
  };

  const currentQuote = quotes[quoteIndex];
  const { _id, quote, author, likeCount, createdBy } = currentQuote ?? {};
  const isOwner = user?.sub === createdBy;

  const selectedCategory = CATEGORY_OPTIONS.find(
    (option) => option.value === category,
  );

  const categoryFilter = (
    <div className="w-full">
      <button
        type="button"
        id="home-category"
        aria-label="Category"
        aria-expanded={categoryOpen}
        aria-controls="home-category-options"
        onClick={() => setCategoryOpen((open) => !open)}
        className="inline-flex h-8 items-center rounded-sm border border-border bg-input px-2 text-xs font-bold uppercase tracking-wider text-foreground"
      >
        {selectedCategory?.label ?? "All quotes"}
      </button>
      {categoryOpen ? (
        <ul
          id="home-category-options"
          className="mt-2 flex w-full flex-col gap-1"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                aria-current={option.value === category ? "true" : undefined}
                onClick={() => handleCategoryChange(option.value)}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-input aria-[current=true]:bg-input"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  const handleQuoteIndexUpdate = () => {
    if (quotes.length === 0) return;
    setQuoteIndex(getRandomNumber(0, quotes.length - 1));
  };

  const handleLikeQuote = async () => {
    if (!_id || !user?.sub) return;

    const result = await toggleLikeQuote(_id);
    if (!result || "error" in result || result.likeCount === undefined) return;

    const userId = user.sub;

    setQuotes((prev) =>
      prev.map((item) => {
        if (item._id !== _id) return item;

        const currentLikedBy = item.likedBy || [];
        return {
          ...item,
          likeCount: result.likeCount ?? item.likeCount,
          likedBy: result.liked
            ? [...currentLikedBy.filter((id) => id !== userId), userId]
            : currentLikedBy.filter((id) => id !== userId),
        };
      }),
    );
  };

  return (
    <Main variant="primary">
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          <Useravatar variant="primary" name={user?.name} picture={user?.picture} />

          {!userLoading && !user && (
            <>
              <a href="/auth/login" className={navLinkClass}>
                Log in
              </a>
              <Link href="/user/quotes/liked" className={navLinkClass}>
                See quotes I liked
              </Link>
            </>
          )}

          {!userLoading && user && (
            <>
              <a href="/auth/logout" className={navLinkClass}>
                Log out
              </a>
              <Link href="/user/quotes/new" className={navLinkClass}>
                Add Quote
              </Link>
              <Link href="/user/quotes/liked" className={navLinkClass}>
                See quotes I liked
              </Link>
            </>
          )}
        </div>
        <div>
          <ThemeSwitcher />
        </div>
      </Nav>

      <div className="w-full max-w-lg px-5 flex flex-col items-center gap-5 mt-16 sm:mt-0">
        <QuoteCard
          quote={
            quote ?? (
              <p className="text-lg font-medium text-muted">
                No quotes in this category.
              </p>
            )
          }
          author={author ?? <span />}
          category={categoryFilter}
          likeCount={likeCount}
          action={
            _id ? (
              <Button
                variant={"primary"}
                onClick={handleLikeQuote}
                aria-label="Like this quote"
              >
                ❤️
              </Button>
            ) : null
          }
        >
          {_id ? (
            <Button variant={"primary"} onClick={handleQuoteIndexUpdate}>
              Next Quote
            </Button>
          ) : null}
          {!_id && user && (
            <Link href="/user/quotes/new" className={navLinkClass}>
              Add a Quote Now
            </Link>
          )}
          {!_id && !userLoading && !user && (
            <a href="/auth/login" className={navLinkClass}>
              Log In to Add a Quote
            </a>
          )}
          {isOwner && _id && (
            <div className="mt-1 flex flex-col">
              <Button
                variant={"primary"}
                onClick={() => router.push(`/user/quotes/edit/${_id}`)}
              >
                Edit
              </Button>
              <div className="mt-1 flex flex-col">
                <Button
                  variant={"primary"}
                  onClick={() => router.push(`/user/quotes/delete?id=${_id}`)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </QuoteCard>
      </div>
    </Main>
  );
}
