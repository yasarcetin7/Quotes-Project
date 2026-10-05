"use server";

import { auth0 } from "@/lib/auth0";
import { ObjectId } from "mongodb";
import { getDb, Collections } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleLikeQuote(quoteId: string) {
    const session = await auth0.getSession();
    if (!session?.user) {
        return { error: "Please log in to like a quote." };
    }

    if (!ObjectId.isValid(quoteId)) {
        return { error: "Invalid quote." };
    }

    const db = await getDb();
    const col = db.collection(Collections.quotes);
    const userId = session.user.sub;

    const quote = await col.findOne({
        _id: new ObjectId(quoteId),
        adminApproved: true,
    });

    if (!quote) {
        return { error: "Quote not found." };
    }

    const likedBy: string[] = Array.isArray(quote.likedBy) ? quote.likedBy : [];
    const alreadyLiked = likedBy.includes(userId);
    const nextLikedBy = alreadyLiked
        ? likedBy.filter((id) => id !== userId)
        : [...likedBy, userId];

    await col.updateOne(
        { _id: new ObjectId(quoteId) },
        {
            $set: {
                likedBy: nextLikedBy,
                likeCount: nextLikedBy.length,
            },
        },
    );

    revalidatePath("/");
    revalidatePath("/user/quotes/liked");

    return {
        success: true,
        liked: !alreadyLiked,
        likeCount: nextLikedBy.length,
    };
}