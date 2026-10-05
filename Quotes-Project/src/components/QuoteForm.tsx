"use client";

import { useActionState, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { QuoteCard } from "@/components/QuoteCard";
import { Field, FieldError, FieldLabel } from "@/components/field";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AddNewQuoteState,
  newQuoteSchema,
  NewQuoteInput,
} from "@/types/quotes";

const CATEGORIES = ["life", "health", "motivation", "wisdom"] as const;

const initialState: AddNewQuoteState = {
  success: false,
};

function toCategoryValue(
  category?: string | string[] | null,
): (typeof CATEGORIES)[number] | "" {
  const first = Array.isArray(category) ? category[0] : category;
  const value = first?.toLowerCase();

  if (value && CATEGORIES.includes(value as (typeof CATEGORIES)[number])) {
    return value as (typeof CATEGORIES)[number];
  }

  return "";
}

export function QuoteForm({
  action,
  defaultAuthor = "",
  defaultQuote = "",
  defaultCategory,
  submitLabel,
  successHref,
  secondary,
}: {
  action: (
    state: AddNewQuoteState,
    formData: FormData,
  ) => Promise<AddNewQuoteState>;
  defaultAuthor?: string;
  defaultQuote?: string;
  defaultCategory?: string | string[] | null;
  submitLabel: string;
  successHref?: string;
  secondary?: ReactNode;
}) {
  const [state, dispatchAction, isPending] = useActionState<
    AddNewQuoteState,
    FormData
  >(action, initialState);

  const categoryValue = toCategoryValue(
    state.data?.category ?? defaultCategory,
  );

  const {
    register,
    control,
    formState: { errors: clientSideErrors },
  } = useForm<NewQuoteInput>({
    mode: "onBlur",
    resolver: zodResolver(newQuoteSchema),
    defaultValues: {
      author: defaultAuthor,
      quote: defaultQuote,
      category: categoryValue,
    },
  });

  if (isPending) {
    return <p className="text-lg font-medium text-foreground">Loading...</p>;
  }

  if (state.success && successHref) {
    redirect(successHref);
  }

  return (
    <form className="w-full" action={dispatchAction}>
      {state.message ? (
        <p className="mb-4 text-sm font-medium text-danger">{state.message}</p>
      ) : null}
      <QuoteCard
        category={
          <Field>
            <FieldLabel
              htmlFor="category"
              className="text-[10px] uppercase font-bold tracking-wider text-foreground"
            >
              Category
            </FieldLabel>
            <Controller
              name="category"
              control={control}
              defaultValue={categoryValue}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || categoryValue}
                  name={field.name}
                >
                  <SelectTrigger
                    id="category"
                    className="h-12 w-full rounded-md border border-border bg-background text-foreground"
                    aria-invalid={!!state.errors?.fieldErrors?.category}
                  >
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="z-50 border border-border bg-background text-foreground shadow-xl"
                  >
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {state.errors?.fieldErrors?.category && (
              <FieldError errors={state.errors.fieldErrors.category}>
                {state.errors.fieldErrors.category}
              </FieldError>
            )}
            {clientSideErrors.category && (
              <FieldError errors={[clientSideErrors.category.message!]}>
                {clientSideErrors.category.message}
              </FieldError>
            )}
          </Field>
        }
        quote={
          <Field>
            <FieldLabel htmlFor="quote">Quote</FieldLabel>
            <Textarea
              id="quote"
              placeholder="I came, I saw, I conquered"
              className="min-h-28 resize-none text-2xl font-semibold text-foreground md:text-2xl"
              aria-invalid={!!state.errors?.fieldErrors?.quote}
              defaultValue={state.data?.quote ?? defaultQuote}
              {...register("quote")}
            />
            {state.errors?.fieldErrors?.quote && (
              <FieldError errors={state.errors.fieldErrors.quote}>
                {state.errors.fieldErrors.quote}
              </FieldError>
            )}
            {clientSideErrors.quote && (
              <FieldError errors={[clientSideErrors.quote.message]}>
                {clientSideErrors.quote.message}
              </FieldError>
            )}
          </Field>
        }
        author={
          <Field>
            <FieldLabel
              htmlFor="author"
              className="text-sm font-semibold text-muted md:text-base"
            >
              Author
            </FieldLabel>
            <Input
              type="text"
              id="author"
              placeholder="Julius Caesar"
              required
              className="h-auto rounded-md border-border bg-transparent py-2 text-left text-sm font-semibold text-muted placeholder:text-left md:text-base"
              aria-invalid={!!state.errors?.fieldErrors?.author}
              defaultValue={state.data?.author ?? defaultAuthor}
              {...register("author")}
            />
            {state.errors?.fieldErrors?.author && (
              <FieldError errors={state.errors.fieldErrors.author}>
                {state.errors.fieldErrors.author[0]}
              </FieldError>
            )}
            {clientSideErrors.author && (
              <FieldError errors={[clientSideErrors.author.message]}>
                {clientSideErrors.author.message}
              </FieldError>
            )}
          </Field>
        }
      >
        <Button variant="primary" type="submit">
          {submitLabel}
        </Button>
        {secondary}
      </QuoteCard>
    </form>
  );
}
