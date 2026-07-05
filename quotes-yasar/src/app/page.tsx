"use client";

import { useContext } from "react";
import { Button } from "@/components/Button";
import { H3 } from "@/typography/H3";
import { QuotesContext } from "./QuotesContext";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useUser } from "@auth0/nextjs-auth0/client";
import { deleteQuoteAction } from "../app/(protected)/user/quotes/new/action";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Main } from "@/components/Main";

const CATEGORIES = ["All", "life", "health", "motivation", "wisdom"];

export default function Home() {
  const router = useRouter();
  // 1. Context ve User kancalarından verileri çekiyoruz
  
  const {
    filteredQuotes,
    activeCategory,
    setActiveCategory,
    quoteIndex,
    isLoading: quotesLoading, // User'ın isLoading'i ile karışmasın diye yeniden adlandırdık
    error,
    handleQuoteIndexUpdate,
    handleLikeQuote,
  } = useContext(QuotesContext);
  const { user, isLoading: userLoading } = useUser();
const handleTestLike = async () => {
    console.log("Kalp butonuna TIKLANDI! Bu yazı konsola geldi.");
    alert("Buton başarıyla çalışıyor! Tıklamayı algıladı.");
    
    // Eğer istersen asıl beğeni fonksiyonunu da hemen altında çalıştırabilirsin:
    // await handleLikeQuote(); 
  };
  // 2. Yüklenme (Loading) Durumu
  if (quotesLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-base-200 transition-colors duration-300">
        <p className="text-xl font-semibold">Loading quotes...</p>
      </main>
    );
  }

  // 3. Hata (Error) Durumu
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-base-200 transition-colors duration-300">
        <p className="text-xl font-semibold text-error">Error: {error}</p>
      </main>
    );
  }

  // 4. Veri Yoksa (Boş Durum)
  const currentQuote = filteredQuotes[quoteIndex];
  if (!currentQuote) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-base-200 transition-colors duration-300">
        <div className="text-center">
          <p className="mb-6 text-lg font-medium text-slate-600">
            No quotes yet. Add one or approve quotes in the database.
          </p>

          {/* Kullanıcı giriş YAPMIŞSA Söz Ekle butonu çıksın */}
          {user && (
            <Link
              href="/user/quotes/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add a Quote Now
            </Link>
          )}

          {/* Kullanıcı giriş YAPMAMIŞSA Log In butonu çıksın */}
          {!userLoading && !user && (
            <a
              href="/auth/login"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Log In to Add a Quote
            </a>
          )}
        </div>
      </main>
    );
  }

  const { _id, quote, author, likeCount, createdBy } = currentQuote;
  const isOwner = user?.sub === createdBy;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quote?",
    );
    if (!confirmDelete) return;

    try {
      await deleteQuoteAction(_id!.toString()); // İşte o soluk yazıyı burada kullanıyoruz!
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <Main variant="primary">
      {/* up navigation menu */}
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          {/* avatar */}
          <div className="w-10 sm:w-12 rounded-full border-2 border-primary overflow-hidden shadow-sm">
            <img
              src={
                user?.picture ||
                `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random`
              }
              alt="User Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* KULLANICI GİRİŞ YAPMAMIŞSA */}
          {!userLoading && !user && (
            <>
              <a
                href="/auth/login"
                className="btn btn-sm btn-success text-success-content rounded-md shadow-sm border border-base-content/20"
              >
                Log in
              </a>
              <Link
                href="/user/quotes/liked"
                className="btn btn-sm btn-primary text-primary-content rounded-md shadow-sm border border-base-content/20"
              >
                See quotes I liked
              </Link>
            </>
          )}

          {/* KULLANICI GİRİŞ YAPMIŞSA */}
          {!userLoading && user && (
            <>
              <a
                href="/auth/logout"
                className="btn btn-sm btn-success text-success-content rounded-md shadow-sm border border-base-content/20"
              >
                Log out
              </a>
              <Link
                href="/user/quotes/new"
                className="btn btn-sm btn-primary text-primary-content rounded-md shadow-sm border border-base-content/20"
              >
                Add Quote
              </Link>
              <Link
                href="/user/quotes/liked"
                className="btn btn-sm btn-primary text-primary-content rounded-md shadow-sm border border-base-content/20"
              >
                See quotes I liked
              </Link>
            </>
          )}
        </div>
        {/* TEMA DEĞİŞTİRİCİ */}
        <div>
          <ThemeSwitcher />
        </div>
      </Nav>

      {/* --- ANA İÇERİK (Söz Kartı) --- */}
      <div className="w-full max-w-lg px-5 flex flex-col items-center gap-5 mt-16 sm:mt-0">
        <section className="bg-base-100 rounded-md p-8 md:p-12 flex flex-col w-full shadow-xl border border-base-content/20 relative overflow-hidden">
          <span className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-wider text-primary/70 bg-primary/10 px-2 py-1 rounded-sm">
            {currentQuote.category ? currentQuote.category.join(", ") : "General"}
          </span>

          <div className="self-end flex items-center gap-3 mb-4 md:mb-6">
            <span className="font-bold text-error">{likeCount || 0} Like</span>
            <Button
              variant={"primary"}
              onClick={handleLikeQuote}
              className="relative z-50 text-lg cursor-pointer"
              aria-label="Like this quote"
            >
              ❤️
            </Button>
          </div>

          <H3 element="p">{quote}</H3>

          <span className="text-sm md:text-base font-semibold text-base-content/80 self-end mt-4">
            - {author}
          </span>

          <div className="mt-4 md:mt-3 flex flex-col">
            <Button variant={"primary"} onClick={handleQuoteIndexUpdate}>
              Next Quote
            </Button>
            {isOwner && (
              <div className="mt-4 md:mt-3 flex flex-col">
                <Button
                  variant={"primary"}
                  onClick={() => router.push(`/user/quotes/edit/${_id}`)}
                >
                  Edit
                </Button>
                <div className="mt-4 md:mt-3 flex flex-col">
                  <Button variant={"primary"} onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
          
        </section>
      </div>
    </Main>
  );
}
