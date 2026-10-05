"use client";

import React, { createContext, useState, useEffect } from "react";
import { Quote } from "../types/quotes";
import { getRandomNumber } from "../utils/helperfunctions";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toggleLikeQuote } from "./(protected)/user/quotes/liked/action";

interface QuotesContextType {
  quotes: Quote[];
  filteredQuotes: Quote[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  quoteIndex: number;
  isLoading: boolean;
  error: string | null;
  handleQuoteIndexUpdate: () => void;
  handleLikeQuote: () => void;
  handleUnlikeQuote: (quoteIdToUnlike: number) => void;
}

export const QuotesContext = createContext<QuotesContextType>(
  {} as QuotesContextType,
);

export function QuotesContextProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [activeCategory, setActiveCategory] = useState<string>("All");

  // TÜM VERİ ÇEKME İŞLEMİ
  useEffect(() => {
    async function fetchQuotes() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/quotes");

        if (!response.ok) {
          throw new Error("Failed to load quotes");
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setQuotes(data);
        } else {
          setQuotes([]);
        }

      } catch (err) {
        console.error("Veri çekilirken hata:", err);
        setError(err instanceof Error ? err.message : "Don't loading quotes");
        setQuotes([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuotes();
  }, []);

  const filteredQuotes = activeCategory === "All"
    ? quotes
    : quotes.filter((q) => q.category && q.category.includes(activeCategory));


  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setQuoteIndex(0);
  };


  function handleQuoteIndexUpdate() {
    if (filteredQuotes.length === 0) return;
    const nextIndex = getRandomNumber(0, filteredQuotes.length - 1);
    setQuoteIndex(nextIndex);
  }

  async function handleLikeQuote() {
    const currentQuote = filteredQuotes[quoteIndex];
    if (!currentQuote?._id || !user?.sub) return;

    const result = await toggleLikeQuote(String(currentQuote._id));
    if (!result || "error" in result || result.likeCount === undefined) return;

    const userId = user.sub;

    setQuotes((prev) =>
      prev.map((quote) => {
        if (String(quote._id) !== String(currentQuote._id)) return quote;

        const currentLikedBy = quote.likedBy || [];
        return {
          ...quote,
          likeCount: result.likeCount,
          isLiked: result.liked,
          likedBy: result.liked
            ? [...currentLikedBy.filter((id) => id !== userId), userId]
            : currentLikedBy.filter((id) => id !== userId),
        };
      }),
    );
  }

  async function handleUnlikeQuote(quoteIdToUnlike: number) {
    const currentQuote = quotes[quoteIdToUnlike];
    if (!currentQuote?._id || !user?.sub) return;

    const result = await toggleLikeQuote(String(currentQuote._id));
    if (!result || "error" in result || result.likeCount === undefined) return;

    const userId = user.sub;

    setQuotes((prev) =>
      prev.map((quote) => {
        if (String(quote._id) !== String(currentQuote._id)) return quote;

        const currentLikedBy = quote.likedBy || [];
        return {
          ...quote,
          likeCount: result.likeCount,
          isLiked: result.liked,
          likedBy: result.liked
            ? [...currentLikedBy.filter((id) => id !== userId), userId]
            : currentLikedBy.filter((id) => id !== userId),
        };
      }),
    );
  }

  return (
    <QuotesContext.Provider
      value={{
        quotes,
        filteredQuotes, // Sayfaya filtrelenmiş olanı gönderiyoruz
        activeCategory,
        setActiveCategory: handleCategoryChange,
        quoteIndex,
        isLoading,
        error,
        handleQuoteIndexUpdate,
        handleLikeQuote,
        handleUnlikeQuote,
      }}
    >
      {children}
    </QuotesContext.Provider>
  );
}