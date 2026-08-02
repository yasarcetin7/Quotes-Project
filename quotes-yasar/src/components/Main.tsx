import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1. Varyantları tanımlıyoruz
const mainVariants = cva(
  // Ortak özellikler: Bütün main'lerde geçerli olacak temel hizalama ve yapı
  "relative min-h-screen flex items-center justify-center transition-colors duration-300",
  {
    variants: {
      variant: {
        // İŞTE SENİN İSTEDİĞİN PRIMARY ÖZELLİĞİ:
         primary: "bg-background text-foreground pt-24 pb-20 sm:pt-0 sm:pb-0 transition-colors duration-300",
        
        // İleride farklı bir arka plan veya padding istersen diye örnek bir secondary
        secondary: "bg-white py-10", 
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface MainProps 
  extends React.HTMLAttributes<HTMLElement>, 
  VariantProps<typeof mainVariants> {}

function Main({ className, variant, ...props }: MainProps) {
  return (
    <main
      className={cn(mainVariants({ variant, className }))}
      {...props} // İçine koyacağın her şeyi (children) burada render eder
    />
  );
}

export { Main, mainVariants };
