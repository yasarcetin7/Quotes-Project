"use client";
import { QuotesContext } from "@/app/QuotesContext";
import { Button } from "@/components/Button";
import { H3 } from "@/typography/H3";
import { useContext } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useUser } from '@auth0/nextjs-auth0';
import { Nav } from '@/components/nav';

export default function LikedQuotesPage() {
  const { quotes, handleUnlikeQuote } = useContext(QuotesContext);
  const { user, isLoading } = useUser();
  const currentUserId = user?.sub || "guest";
  const likedQuotes = quotes
    .map((quote, index) => ({ ...quote, originalIndex: index }))
    .filter((quote) => quote.likedBy?.includes(currentUserId));

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-base-200 transition-colors duration-300 pt-24 pb-20 sm:pt-0 sm:pb-0">
      <Nav variant="primary">
        
        <div className="flex items-center gap-4">

          {/* AVATAR KISMI */}
          <div className="w-10 sm:w-12 rounded-full border-2 border-primary overflow-hidden shadow-sm">
            <img 
              src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
              alt="Tailwind-CSS-Avatar-component"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

   {!isLoading && user && (
						<>
            <a 
              href="/auth/logout" 
              className="btn btn-sm btn-success text-success-content rounded-md shadow-sm border border-base-content/20"
            >
              Log out
            </a>
						<a 
              href="/" 
              className="btn btn-sm btn-success text-success-content rounded-md shadow-sm border border-base-content/20"
            >
              Homepage
            </a></>    )}</div>

<div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>
       </Nav>

      <div className="w-full max-w-lg px-4 flex flex-col items-center gap-4 mt-24">
  
  <div className="font-medium text-primary w-full text-center mt-2 mb-1 border border-base-content/20">
    <H3 element="p">Liked Quotes</H3>
  </div>

  {likedQuotes.length === 0 ? (
    <p className="text-base-content/70 text-lg text-center bg-base-100 w-full p-8 rounded-md shadow-xl border border-base-content/20">
      You haven't liked any of the quotes yet.
    </p>
  ) : (
    <div className="flex flex-col gap-6 w-full">
      {likedQuotes.map((item) => (
        <section
          key={item.originalIndex}
          
          className="bg-base-100 rounded-md p-6 md:p-10 flex flex-col w-full shadow-xl border border-base-content/20"
        >
          <div className="self-end flex items-center gap-3 mb-4 md:mb-6">
            
          
            <span className="font-medium text-base-content/70 text-sm md:text-base">
              Remove from list :
            </span>
                  <Button
                    variant={"secondary"}
                    onClick={() => handleUnlikeQuote(item.originalIndex)}
                    aria-label="Remove quote from liked list"
                  >
                    💔
                  </Button>
                </div>

                <div className="text-base-content">
                  <H3 element="p">{item.quote}</H3>
                </div>

                <span className="text-sm md:text-base font-semibold text-base-content/80 self-end mt-4">
                  - {item.author}
                </span>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
