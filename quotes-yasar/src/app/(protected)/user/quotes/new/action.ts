"use server";

import { auth0 } from "@/lib/auth0";
import { Collections, getDb } from "@/lib/db";
import { newQuoteSchema, AddNewQuoteState } from "@/types/quotes";
import { ObjectId } from "mongodb";

export async function addNewQuote(
  _currentState: AddNewQuoteState,
  formData: FormData,
): Promise<AddNewQuoteState> {
  const session = await auth0.getSession();

  if (!session) {
    return {
      success: false,
      message: "Please log in to add a quote.",
    };
  }
  
  const rawCategoryString = String(formData.get("category") ?? "");

  const rawData = {
    author: String(formData.get("author") ?? ""),
    quote: String(formData.get("quote") ?? ""),
    // Zod doğrulaması için diziye (array) çeviriyoruz
    category: rawCategoryString
      .split(",")
      .map((cat) => cat.trim())
      .filter(Boolean), 
  };

  const validationOutput = newQuoteSchema.safeParse(rawData);

  if (!validationOutput.success) {
    const validationErrors = validationOutput.error.flatten(); 
    console.log("validationErrors", validationErrors);

    return {
      success: false,
      errors: validationErrors,
      data: {
        author: rawData.author,
        quote: rawData.quote,
        category: rawCategoryString, 
      },
    };
  } else {
    const db = await getDb();
    const col = db.collection(Collections.quotes);
    const now = new Date();

    
    const newQuote = {
      quote: validationOutput.data.quote,
      author: validationOutput.data.author,
      category: rawCategoryString,
      createdBy: session.user.sub,
      adminApproved: false,
      createdAt: now,
      updatedAt: now,
      likedBy: [], 
    };

    const newDoc = await col.insertOne(newQuote);
    console.log("newDoc", newDoc);

    return {
      success: true,
    };
  }
}

export async function deleteQuoteAction(quoteId: string) {
  const session = await auth0.getSession();

  if (!session?.user) {
    throw new Error("You must be logged in to delete a quote.");
  }

  const db = await getDb();
  const col = db.collection(Collections.quotes);

  const quote = await col.findOne({ _id: new ObjectId(quoteId) });
  if (!quote) {
    throw new Error("Quote not found.");
  }

  if (quote.createdBy !== session.user.sub) {
    throw new Error("Unauthorized: You can only delete your own quotes.");
  }
  
  await col.deleteOne({ _id: new ObjectId(quoteId) });

  return { success: true };
}