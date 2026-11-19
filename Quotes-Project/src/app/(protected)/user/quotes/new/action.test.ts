import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSession, insertOne, collection, getDb } = vi.hoisted(() => ({
  getSession: vi.fn(),
  insertOne: vi.fn(),
  collection: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("@/lib/auth0", () => ({
  auth0: { getSession },
}));

vi.mock("@/lib/db", () => ({
  getDb,
  Collections: { quotes: "quotes", user: "users" },
}));

import { addNewQuote } from "./action";

const USER_ID = "auth0|writer";

function formWith(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

const validFields = {
  author: "Wilde",
  quote: "Be yourself",
  category: "life",
};

describe("addNewQuote", () => {
  beforeEach(() => {
    getSession.mockReset();
    insertOne.mockReset();
    collection.mockReset();
    getDb.mockReset();

    getSession.mockResolvedValue({ user: { sub: USER_ID } });
    insertOne.mockResolvedValue({ insertedId: "new-quote" });
    collection.mockImplementation(() => ({ insertOne }));
    getDb.mockImplementation(async () => ({ collection }));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not save a quote when nobody is signed in", async () => {
    getSession.mockResolvedValue(null);

    await expect(
      addNewQuote({ success: false }, formWith(validFields)),
    ).resolves.toEqual({
      success: false,
      message: "Please log in to add a quote.",
    });
    expect(getDb).not.toHaveBeenCalled();
    expect(insertOne).not.toHaveBeenCalled();
  });

  it("returns zod warnings and does not save when the form is empty", async () => {
    const result = await addNewQuote(
      { success: false },
      formWith({ author: "", quote: "", category: "" }),
    );

    expect(result.success).toBe(false);
    expect(result.errors?.fieldErrors.author?.[0]).toBe(
      "Author name should be at least 2 characters long",
    );
    expect(result.errors?.fieldErrors.quote?.[0]).toBe(
      "Quote should be at least 6 characters long",
    );
    expect(result.errors?.fieldErrors.category?.[0]).toBe(
      "Please select a category",
    );
    expect(result.data).toEqual({ author: "", quote: "", category: "" });
    expect(getDb).not.toHaveBeenCalled();
  });

  it("returns a zod warning when the author name contains a number", async () => {
    const result = await addNewQuote(
      { success: false },
      formWith({ ...validFields, author: "Wilde2" }),
    );

    expect(result.success).toBe(false);
    expect(result.errors?.fieldErrors.author).toContain(
      "Author name cannot contain numbers",
    );
    expect(insertOne).not.toHaveBeenCalled();
  });

  it("returns a zod warning when the author name is longer than 30 characters", async () => {
    const result = await addNewQuote(
      { success: false },
      formWith({ ...validFields, author: "A".repeat(31) }),
    );

    expect(result.success).toBe(false);
    expect(result.errors?.fieldErrors.author).toContain(
      "Author name should be 50 characters long maximum. Please try a shorter name.",
    );
    expect(insertOne).not.toHaveBeenCalled();
  });

  it("returns a zod warning when the quote is longer than 300 characters", async () => {
    const result = await addNewQuote(
      { success: false },
      formWith({ ...validFields, quote: "Q".repeat(301) }),
    );

    expect(result.success).toBe(false);
    expect(result.errors?.fieldErrors.quote).toContain(
      "Quote should be 300 characters long maximum. Please try a shorter one.",
    );
    expect(insertOne).not.toHaveBeenCalled();
  });

  it("saves a valid quote and trims the author and quote", async () => {
    const result = await addNewQuote(
      { success: false },
      formWith({
        author: "  Wilde  ",
        quote: "  Be yourself  ",
        category: " life ",
      }),
    );

    expect(result).toEqual({ success: true });
    expect(collection).toHaveBeenCalledWith("quotes");
    expect(insertOne).toHaveBeenCalledTimes(1);

    const saved = insertOne.mock.calls[0][0] as {
      author: string;
      quote: string;
      category: string;
      createdBy: string;
      adminApproved: boolean;
      likedBy: string[];
      createdAt: Date;
      updatedAt: Date;
    };
    expect(saved.author).toBe("Wilde");
    expect(saved.quote).toBe("Be yourself");
    expect(saved.category).toBe("life");
    expect(saved.createdBy).toBe(USER_ID);
    expect(saved.adminApproved).toBe(false);
    expect(saved.likedBy).toEqual([]);
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.updatedAt).toBe(saved.createdAt);
  });
});
