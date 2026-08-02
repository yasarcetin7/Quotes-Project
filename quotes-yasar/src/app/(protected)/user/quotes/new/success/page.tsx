'use client';

import Link from 'next/link';
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from '@/components/Button';
import { useUser } from '@auth0/nextjs-auth0';
import { Nav } from "@/components/nav";
import { Main } from "@/components/Main";
export default function NewQuoteSuccessPage() {
  const { user, isLoading } = useUser();

  return (
    <Main variant="primary">
      {/* up navigation menu */}
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          {/* AVATAR KISMI */}
          <div className="w-10 sm:w-12 rounded-full border-2 border-primary overflow-hidden shadow-sm">
            <img 
              src={user?.picture || "https://img.daisyui.com/images/profile/demo/superperson@192.webp"} 
              alt="Tailwind-CSS-Avatar-component"
              className="w-full h-full object-cover"
            />
          </div>

          {!isLoading && user && (
            <>
              <a 
                href="/auth/logout" 
                className="btn btn-sm btn-primary text-primary-content rounded-md shadow-md p-1 gap-3 mx-1 border-2 border-base-content/20"
              >
                Log out
              </a>
              <Link 
                href="/" 
                className="btn btn-sm btn-primary text-primary-content rounded-md shadow-md p-1 gap-3 mx-1 border-2 border-base-content/20"
              >
                Homepage
              </Link>
            </>
          )}
        </div>
        
        <div>
          <ThemeSwitcher />
        </div>
      </Nav>
 <section className="bg-base-100 rounded-md p-8 md:p-12 flex items-center flex-col shadow-xl border border-base-content/20">
          <div className="self-end gap-3 mb-4 md:mb-6 'max-w-md mx-auto text-center mt-20">
      
        <h1 className="text-xl font-medium mb-4 text-base-content">
          Thank you for adding a new quote. It&apos;s now sent to administator
          for review.
        </h1>
        
        <Button variant={"primary"}>
          <Link href='/user/quotes/new'>Add another quote</Link>
        </Button>
      </div></section> 
    </Main>
  );
}