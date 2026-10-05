"use server";

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb, Collections } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { AddNewQuoteState, newQuoteSchema } from "@/types/quotes";

export async function updateQuote(
  quoteId: string,
  _prevState: AddNewQuoteState,
  formData: FormData,
): Promise<AddNewQuoteState> {
  const currentSession = await auth0.getSession();
  if (!currentSession?.user) {
    return {
      success: false,
      message: "Please log in to edit a quote.",
    };
  }

  const rawCategoryString = String(formData.get("category") ?? "");
  const rawData = {
    author: String(formData.get("author") ?? ""),
    quote: String(formData.get("quote") ?? ""),
    category: rawCategoryString
      .split(",")
      .map((category) => category.trim().toLowerCase())
      .filter(Boolean),
  };

  const validationOutput = newQuoteSchema.safeParse(rawData);

  if (!validationOutput.success) {
    return {
      success: false,
      errors: validationOutput.error.flatten(),
      data: {
        author: rawData.author,
        quote: rawData.quote,
        category: rawCategoryString,
      },
    };
  }

  const db = await getDb();
  await db.collection(Collections.quotes).updateOne(
    { _id: new ObjectId(quoteId), createdBy: currentSession.user.sub },
    {
      $set: {
        quote: validationOutput.data.quote,
        author: validationOutput.data.author,
        category: validationOutput.data.category,
        updatedAt: new Date(),
      },
    },
  );

  revalidatePath("/");
  redirect("/");
}