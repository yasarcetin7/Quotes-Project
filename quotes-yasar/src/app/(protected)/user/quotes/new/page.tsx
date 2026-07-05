"use client";
import { Nav } from "@/components/nav";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/Button";
import { Main } from "@/components/Main";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/field";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { useActionState } from "react";
import { addNewQuote } from "./action";
import {
  AddNewQuoteState,
  newQuoteSchema,
  NewQuoteInput,
} from "@/types/quotes";

// 1. Controller'ı react-hook-form'dan import ediyoruz
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialAddNewQuoteState: AddNewQuoteState = {
  success: false,
};

export default function AddNewQuotePage() {
  const { user, isLoading } = useUser();
  const [state, dispatchAction, isPending] = useActionState<
    AddNewQuoteState,
    FormData
  >(addNewQuote, initialAddNewQuoteState);

  // 3. Controller için 'control' fonksiyonunu useForm'dan çekiyoruz
  const {
    register,
    control,
    formState: { errors: clientSideErrors },
  } = useForm<NewQuoteInput>({
    mode: "onBlur",
    resolver: zodResolver(newQuoteSchema),
  });

  if (isPending) return <p>Loading...</p>;

  if (state.success) return redirect("/user/quotes/new/success");

  return (
    <Main variant="primary">
      <Nav variant="primary">
        <div className="flex items-center gap-4">
          {/* AVATAR KISMI */}
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
              </a>
            </>
          )}
        </div>

        <div>
          <ThemeSwitcher />
        </div>
      </Nav>

      <form
        className="bg-base-100 rounded-md p-7 md:p-12 flex flex-col w-full shadow-xl border border-base-content/20 max-w-md"
        action={dispatchAction}
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Add A New Quote</FieldLegend>
            <FieldGroup>
              {/* Author */}
              <Field>
                <FieldLabel htmlFor="author">Author</FieldLabel>
                <Input
                  type="text"
                  id="author"
                  placeholder="Julius Caesar"
                  required
                  aria-invalid={!!state.errors?.fieldErrors?.author}
                  defaultValue={state.data?.author}
                  {...register("author")}
                />
                {state.errors?.fieldErrors?.author && (
                  <FieldError errors={state.errors?.fieldErrors?.author}>
                    {state.errors?.fieldErrors?.author}
                  </FieldError>
                )}
                {clientSideErrors.author && (
                  <FieldError errors={[clientSideErrors.author.message]}>
                    {clientSideErrors.author.message}
                  </FieldError>
                )}
              </Field>

              {/* Quote */}
              <Field>
                <FieldLabel htmlFor="quote">Quote</FieldLabel>
                <Textarea
                  id="quote"
                  placeholder="I came, I saw, I conquered"
                  className="resize-none"
                  aria-invalid={!!state.errors?.fieldErrors?.quote}
                  defaultValue={state.data?.quote}
                  {...register("quote")}
                />
                {state.errors?.fieldErrors?.quote && (
                  <FieldError errors={state.errors?.fieldErrors?.quote}>
                    {state.errors?.fieldErrors?.quote}
                  </FieldError>
                )}
                {clientSideErrors.quote && (
                  <FieldError errors={[clientSideErrors.quote.message]}>
                    {clientSideErrors.quote.message}
                  </FieldError>
                )}
              </Field>

              {/* Category - SHADCN UI KULLANILAN KISIM */}
              <Field>
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Controller
                  name="category"
                  control={control}
                  defaultValue={state.data?.category || ""}
        render={({ field }) => (
          <Select
            onValueChange={(val) => field.onChange(val)}
            defaultValue={field.value || ""}
            name={field.name}
          >
                      <SelectTrigger
                        id="category"
                        className="w-full bg-base-100 border-base-content/20 focus:ring-primary"
                        aria-invalid={!!state.errors?.fieldErrors?.category}
                      >
                        <SelectValue placeholder="Select a category..." />
                      </SelectTrigger>
                      <SelectContent position="popper" className="bg-base-100 shadow-xl z-50 border border-base-content/20">
                        <SelectItem value="life">Life</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="motivation">Motivation</SelectItem>
                        <SelectItem value="wisdom">Wisdom</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                {state.errors?.fieldErrors?.category && (
                  <FieldError errors={state.errors?.fieldErrors?.category}>
                    {state.errors?.fieldErrors?.category}
                  </FieldError>
                )}

                {clientSideErrors.category && (
                  <FieldError errors={[clientSideErrors.category.message!]}>
                    {clientSideErrors.category.message}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button variant="primary" type="submit">
              Create
            </Button>
            <Button variant="primary" type="reset">
              Clear
            </Button>
          </Field>
        </FieldGroup>
      </form>
      {state.message ? <p className="mt-10">{state.message}</p> : <></>}
    </Main>
  );
}
