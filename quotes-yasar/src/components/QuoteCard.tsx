import type { ReactNode } from "react";
import { H3 } from "@/typography/H3";

function categoryLabel(category?: string | string[] | null) {
  if (Array.isArray(category) && category.length > 0) {
    return category.join(", ");
  }

  if (typeof category === "string" && category.trim()) {
    return category;
  }

  return "General";
}

function isCustomCategory(
  category: string | string[] | null | ReactNode,
): category is Exclude<ReactNode, string | string[] | null | undefined> {
  return category != null && typeof category === "object" && !Array.isArray(category);
}

export function QuoteCard({
  quote,
  author,
  category,
  likeCount,
  action,
  children,
}: {
  quote: ReactNode;
  author: ReactNode;
  category?: string | string[] | null | ReactNode;
  likeCount?: number;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const customCategory = isCustomCategory(category) ? category : null;

  return (
    <section className="bg-background rounded-md p-8 md:p-12 flex flex-col w-full shadow-xl border border-border relative overflow-hidden">
      {customCategory ? (
        <div className="mb-4">{customCategory}</div>
      ) : (
        <span className="absolute top-4 left-4 text-[10px] uppercase font-bold tracking-wider text-foreground bg-input px-2 py-1 rounded-sm">
          {categoryLabel(category as string | string[] | null | undefined)}
        </span>
      )}

      {(likeCount !== undefined || action) && (
        <div className="self-end flex items-center gap-3 mb-4 md:mb-6">
          {likeCount !== undefined && (
            <span className="font-bold text-danger">{likeCount || 0} Like</span>
          )}
          {action}
        </div>
      )}

      {typeof quote === "string" ? <H3 element="p">{quote}</H3> : quote}

      {typeof author === "string" ? (
        <span className="text-sm md:text-base font-semibold text-muted self-end mt-4">
          - {author}
        </span>
      ) : (
        <div className="mt-4 w-full self-start text-left">{author}</div>
      )}

      {children ? <div className="mt-1 flex flex-col">{children}</div> : null}
    </section>
  );
}
