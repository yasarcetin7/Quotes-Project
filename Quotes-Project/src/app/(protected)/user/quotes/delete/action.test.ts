import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";

const { getSession, findOne, deleteOne, collection, revalidatePath, redirect } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
    collection: vi.fn(),
    revalidatePath: vi.fn(),
    redirect: vi.fn((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    }),
  }));

vi.mock("@/lib/auth0", () => ({
  auth0: { getSession },
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(async () => ({ collection })),
  Collections: { quotes: "quotes", user: "users" },
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import { deleteQuoteAction } from "./action";

const QUOTE_ID = "507f1f77bcf86cd799439011";
const OWNER_ID = "auth0|owner";

function formWith(quoteId: string) {
  const formData = new FormData();
  formData.set("quoteId", quoteId);
  return formData;
}

async function runAction(formData: FormData) {
  await expect(deleteQuoteAction(formData)).rejects.toThrow(/^REDIRECT:/);
}

describe("deleteQuoteAction", () => {
  beforeEach(() => {
    getSession.mockReset();
    findOne.mockReset();
    deleteOne.mockReset();
    collection.mockReset();
    revalidatePath.mockReset();
    redirect.mockClear();

    collection.mockImplementation(() => ({ findOne, deleteOne }));
    deleteOne.mockResolvedValue({ deletedCount: 1 });
    redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it("deletes the quote when the signed-in user created it", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID } });
    findOne.mockResolvedValue({ createdBy: OWNER_ID });

    await runAction(formWith(QUOTE_ID));

    expect(collection).toHaveBeenCalledWith("quotes");
    expect(deleteOne).toHaveBeenCalledTimes(1);

    const filter = deleteOne.mock.calls[0][0] as { _id: ObjectId };
    expect(filter._id).toBeInstanceOf(ObjectId);
    expect(filter._id.toString()).toBe(QUOTE_ID);
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/user/quotes/liked");
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("does not delete a quote created by someone else", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID } });
    findOne.mockResolvedValue({ createdBy: "auth0|someone-else" });

    await runAction(formWith(QUOTE_ID));

    expect(deleteOne).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("does not delete when the quote does not exist", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID } });
    findOne.mockResolvedValue(null);

    await runAction(formWith(QUOTE_ID));

    expect(deleteOne).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("does not delete when the id is invalid", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID } });

    await runAction(formWith("not-an-id"));

    expect(collection).not.toHaveBeenCalled();
    expect(deleteOne).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("does not delete when nobody is signed in", async () => {
    getSession.mockResolvedValue(null);

    await runAction(formWith(QUOTE_ID));

    expect(collection).not.toHaveBeenCalled();
    expect(deleteOne).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });
});
