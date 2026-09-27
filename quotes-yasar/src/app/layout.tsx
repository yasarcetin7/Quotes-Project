import "./globals.css";
import { QuotesContextProvider } from "./QuotesContext";
import { Providers } from "./providers";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Random Quotes App",
  description: "Random Quotes App",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full antialiased", "font-sans", geist.variable)}>
      
      <body suppressHydrationWarning className="min-h-full bg-base-300 text-base-content transition-colors duration-300">
        <Providers>
          <QuotesContextProvider>
            {children}
          </QuotesContextProvider>
        </Providers>
      </body>
    </html>
  );
}