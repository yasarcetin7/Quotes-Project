"use client";

import React, { createContext, useState, useEffect } from "react";
import { Quote } from "../types/quotes"; 
import { getRandomNumber } from "../utils/helperfunctions";
import { useUser } from "@auth0/nextjs-auth0/client";

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
  
  // 🚀 FİLTRELEME STATE'İ
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

  // 🚀 YENİ: Kategoriyi değiştiren ve Index'i sıfırlayan özel fonksiyon
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setQuoteIndex(0); // Liste değiştiğinde her zaman ilk söze dön
  };

  // Sonraki söze geçme mantığı artık tüm sözler (quotes) üzerinden değil, filtrelenenler üzerinden çalışıyor
  function handleQuoteIndexUpdate() {
    if (filteredQuotes.length === 0) return; 
    const nextIndex = getRandomNumber(0, filteredQuotes.length - 1);
    setQuoteIndex(nextIndex);
  }

  function handleLikeQuote() {
    const currentQuote = filteredQuotes[quoteIndex];
    if (!currentQuote) return;

    // 1. Şu anki kullanıcının ID'sini alıyoruz
    const userId = user?.sub || "guest";

    const updatedQuotes = quotes.map((quote) => {
      if (quote._id === currentQuote._id || quote.quote === currentQuote.quote) {
        const currentLikes = typeof quote.likeCount === "number" ? quote.likeCount : 0;
        
        // EĞER ZATEN BEĞENİLMİŞSE BEĞENİYİ GERİ AL
        if (quote.isLiked) {
          // Kullanıcının ID'sini listeden çıkarıyoruz
          const newLikedBy = quote.likedBy ? quote.likedBy.filter((id: string) => id !== userId) : [];
          return { ...quote, likeCount: currentLikes - 1, isLiked: false, likedBy: newLikedBy };
        } 
        // EĞER BEĞENİLMEMİŞSE BEĞEN
        else {
          // Kullanıcının ID'sini listeye ekliyoruz
          const newLikedBy = quote.likedBy ? [...quote.likedBy, userId] : [userId];
          return { ...quote, likeCount: currentLikes + 1, isLiked: true, likedBy: newLikedBy };
        }
      }
      return quote;
    });

    setQuotes(updatedQuotes);
    localStorage.setItem("mySavedQuotes", JSON.stringify(updatedQuotes));
  }

  function handleUnlikeQuote(quoteIdToUnlike: number) {
    const userId = user?.sub || "guest";

    const updatedQuotes = quotes.map((quote, id) => {
      if (id === quoteIdToUnlike) {
        const currentLikes = typeof quote.likeCount === "number" ? quote.likeCount : 1;
        return { ...quote, likeCount: currentLikes - 1, isLiked: false };
      }
      return quote;
    });

    setQuotes(updatedQuotes);
    localStorage.setItem("mySavedQuotes", JSON.stringify(updatedQuotes));
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