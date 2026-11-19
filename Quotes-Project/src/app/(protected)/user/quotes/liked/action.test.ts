import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";

const { getSession, findOne, updateOne, collection, getDb, revalidatePath } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    collection: vi.fn(),
    getDb: vi.fn(),
    revalidatePath: vi.fn(),
  }));

vi.mock("@/lib/auth0", () => ({
  auth0: { getSession },
}));

vi.mock("@/lib/db", () => ({
  getDb,
  Collections: { quotes: "quotes", user: "users" },
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

import { toggleLikeQuote } from "./action";

const QUOTE_ID = "507f1f77bcf86cd799439011";
const USER_ID = "auth0|reader";

describe("toggleLikeQuote", () => {
  beforeEach(() => {
    getSession.mockReset();
    findOne.mockReset();
    updateOne.mockReset();
    collection.mockReset();
    getDb.mockReset();
    revalidatePath.mockReset();

    collection.mockImplementation(() => ({ findOne, updateOne }));
    getDb.mockImplementation(async () => ({ collection }));
    updateOne.mockResolvedValue({ modifiedCount: 1 });
  });

  it("fails when nobody is signed in and does not touch the database", async () => {
    getSession.mockResolvedValue(null);

    await expect(toggleLikeQuote(QUOTE_ID)).resolves.toEqual({
      error: "Please log in to like a quote.",
    });
    expect(getDb).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("fails when the quote id is invalid", async () => {
    getSession.mockResolvedValue({ user: { sub: USER_ID } });

    await expect(toggleLikeQuote("not-an-id")).resolves.toEqual({
      error: "Invalid quote.",
    });
    expect(getDb).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("fails when the approved quote cannot be found", async () => {
    getSession.mockResolvedValue({ user: { sub: USER_ID } });
    findOne.mockResolvedValue(null);

    await expect(toggleLikeQuote(QUOTE_ID)).resolves.toEqual({
      error: "Quote not found.",
    });

    expect(collection).toHaveBeenCalledWith("quotes");
    const filter = findOne.mock.calls[0][0] as {
      _id: ObjectId;
      adminApproved: boolean;
    };
    expect(filter._id).toBeInstanceOf(ObjectId);
    expect(filter._id.toString()).toBe(QUOTE_ID);
    expect(filter.adminApproved).toBe(true);
    expect(updateOne).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("likes the quote and reports success when the user has not liked it yet", async () => {
    getSession.mockResolvedValue({ user: { sub: USER_ID } });
    findOne.mockResolvedValue({
      _id: new ObjectId(QUOTE_ID),
      adminApproved: true,
      likedBy: ["auth0|someone-else"],
    });

    await expect(toggleLikeQuote(QUOTE_ID)).resolves.toEqual({
      success: true,
      liked: true,
      likeCount: 2,
    });

    const filter = updateOne.mock.calls[0][0] as { _id: ObjectId };
    const update = updateOne.mock.calls[0][1] as {
      $set: { likedBy: string[]; likeCount: number };
    };
    expect(filter._id).toBeInstanceOf(ObjectId);
    expect(filter._id.toString()).toBe(QUOTE_ID);
    expect(update.$set.likedBy).toEqual(["auth0|someone-else", USER_ID]);
    expect(update.$set.likeCount).toBe(2);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/user/quotes/liked");
  });

  it("removes the like and reports success when the user already liked it", async () => {
    getSession.mockResolvedValue({ user: { sub: USER_ID } });
    findOne.mockResolvedValue({
      _id: new ObjectId(QUOTE_ID),
      adminApproved: true,
      likedBy: ["auth0|someone-else", USER_ID],
    });

    await expect(toggleLikeQuote(QUOTE_ID)).resolves.toEqual({
      success: true,
      liked: false,
      likeCount: 1,
    });

    const update = updateOne.mock.calls[0][1] as {
      $set: { likedBy: string[]; likeCount: number };
    };
    expect(update.$set.likedBy).toEqual(["auth0|someone-else"]);
    expect(update.$set.likeCount).toBe(1);
    expect(revalidatePath).toHaveBeenCalledWith("/user/quotes/liked");
  });

  it("likes a quote that has no likedBy list yet", async () => {
    getSession.mockResolvedValue({ user: { sub: USER_ID } });
    findOne.mockResolvedValue({
      _id: new ObjectId(QUOTE_ID),
      adminApproved: true,
    });

    await expect(toggleLikeQuote(QUOTE_ID)).resolves.toEqual({
      success: true,
      liked: true,
      likeCount: 1,
    });

    const update = updateOne.mock.calls[0][1] as {
      $set: { likedBy: string[]; likeCount: number };
    };
    expect(update.$set.likedBy).toEqual([USER_ID]);
    expect(update.$set.likeCount).toBe(1);
  });
});
