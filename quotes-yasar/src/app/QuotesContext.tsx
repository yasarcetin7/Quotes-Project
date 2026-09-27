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
    // Beğenilen sözü filtrelenmiş listeden buluyoruz
    const currentQuote = filteredQuotes[quoteIndex];
    if (!currentQuote) return;

    // Kullanıcı ID'sini alıyoruz (Giriş yapmamışsa 'guest' kullanır)
    const userId = user?.sub || "guest";

    const updatedQuotes = quotes.map((quote) => {
      // Index yerine ID veya söz metni ile eşleştirme yapıyoruz
      if (quote._id === currentQuote._id || quote.quote === currentQuote.quote) {
        const currentLikes = typeof quote.likeCount === "number" ? quote.likeCount : 0;
        const currentLikedBy = quote.likedBy || []; // Hata vermemesi için boş dizi kalkanı

        if (quote.isLiked || currentLikedBy.includes(userId)) {
          // BEĞENİYİ KALDIR: Kullanıcıyı likedBy dizisinden filtreleyerek çıkar
          return { 
            ...quote, 
            likeCount: currentLikes > 0 ? currentLikes - 1 : 0, 
            isLiked: false,
            likedBy: currentLikedBy.filter((id) => id !== userId)
          };
        } else {
          // BEĞEN: Kullanıcıyı likedBy dizisine ekle
          return { 
            ...quote, 
            likeCount: currentLikes + 1, 
            isLiked: true,
            likedBy: [...currentLikedBy, userId]
          };
        }
      }
      return quote;
    });

    // 🚀 EKSİK OLAN KISIM EKLENDİ (State'i ve LocalStorage'ı güncelleme)
    setQuotes(updatedQuotes);
    localStorage.setItem("mySavedQuotes", JSON.stringify(updatedQuotes));
  } // 🚀 EKSİK KAPANMA PARANTEZİ EKLENDİ

  function handleUnlikeQuote(quoteIdToUnlike: number) {
    const userId = user?.sub || "guest";

    const updatedQuotes = quotes.map((quote, id) => {
      if (id === quoteIdToUnlike) {
        const currentLikes = typeof quote.likeCount === "number" ? quote.likeCount : 1;
        const currentLikedBy = quote.likedBy || [];

        // BEĞENİYİ KALDIR: (Liked sayfasından tıklandığında çalışır)
        return { 
          ...quote, 
          likeCount: currentLikes > 0 ? currentLikes - 1 : 0, 
          isLiked: false,
          likedBy: currentLikedBy.filter((uid) => uid !== userId)
        };
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