"use server";

import { auth0 } from "@/lib/auth0";
import { Collections, getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteQuoteAction(formData: FormData) {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const quoteId = String(formData.get("quoteId") ?? "");

  if (!ObjectId.isValid(quoteId)) {
    redirect("/");
  }

  const db = await getDb();
  const col = db.collection(Collections.quotes);
  const quote = await col.findOne({ _id: new ObjectId(quoteId) });

  if (!quote || quote.createdBy !== session.user.sub) {
    redirect("/");
  }

  await col.deleteOne({ _id: new ObjectId(quoteId) });
  revalidatePath("/");
  revalidatePath("/user/quotes/liked");
  redirect("/");
}
