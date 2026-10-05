import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const navVariants = cva(

  "w-full flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 px-4 sm:px-6 md:px-10 z-50",
  {
    variants: {
      variant: {
        primary: "absolute top-0 left-0 shadow-sm bg-input border-b border-border text-foreground transition-colors duration-300",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface NavProps 
  extends React.HTMLAttributes<HTMLElement>, 
  VariantProps<typeof navVariants> {}

function Nav({ className, variant, ...props }: NavProps) {
  return (
    <nav
      className={cn(navVariants({ variant, className }))}
      {...props} 
    />
  );
}

export { Nav, navVariants };