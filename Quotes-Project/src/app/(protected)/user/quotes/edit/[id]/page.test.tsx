import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";

const { getSession, findOne, collection, getDb, redirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  findOne: vi.fn(),
  collection: vi.fn(),
  getDb: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/auth0", () => ({
  auth0: { getSession },
}));

vi.mock("@/lib/db", () => ({
  getDb,
  Collections: { quotes: "quotes", user: "users" },
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href }, children),
}));

vi.mock("@/components/ThemeSwitcher", () => ({
  default: () => null,
}));

vi.mock("./action", () => ({
  updateQuote: vi.fn(),
}));

vi.mock("@/components/QuoteForm", () => ({
  QuoteForm: ({
    defaultQuote,
    defaultAuthor,
    defaultCategory,
    submitLabel,
    successHref,
  }: {
    defaultQuote: string;
    defaultAuthor: string;
    defaultCategory: string | string[];
    submitLabel: string;
    successHref: string;
  }) =>
    React.createElement(
      "form",
      null,
      defaultQuote,
      defaultAuthor,
      Array.isArray(defaultCategory)
        ? defaultCategory.join(",")
        : defaultCategory,
      submitLabel,
      successHref,
    ),
}));

import EditQuotePage from "./page";

const QUOTE_ID = "507f1f77bcf86cd799439011";
const OWNER_ID = "auth0|owner";

function pageFor(id: string) {
  return EditQuotePage({ params: Promise.resolve({ id }) });
}

describe("EditQuotePage", () => {
  beforeEach(() => {
    getSession.mockReset();
    findOne.mockReset();
    collection.mockReset();
    getDb.mockReset();
    redirect.mockReset();

    collection.mockImplementation(() => ({ findOne }));
    getDb.mockImplementation(async () => ({ collection }));
    redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it("sends a signed-out visitor to login and does not read the database", async () => {
    getSession.mockResolvedValue(null);

    await expect(pageFor(QUOTE_ID)).rejects.toThrow("REDIRECT:/auth/login");
    expect(getDb).not.toHaveBeenCalled();
  });

  it("shows quote not found for an invalid id without querying", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID, name: "Ada" } });

    const html = renderToStaticMarkup(await pageFor("not-an-id"));

    expect(html).toContain("Quote not found.");
    expect(getDb).not.toHaveBeenCalled();
  });

  it("shows quote not found when the id is valid but the quote is missing", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID, name: "Ada" } });
    findOne.mockResolvedValue(null);

    const html = renderToStaticMarkup(await pageFor(QUOTE_ID));

    expect(html).toContain("Quote not found.");
    expect(collection).toHaveBeenCalledWith("quotes");
    const filter = findOne.mock.calls[0][0] as { _id: ObjectId };
    expect(filter._id).toBeInstanceOf(ObjectId);
    expect(filter._id.toString()).toBe(QUOTE_ID);
  });

  it("refuses to edit a quote created by someone else", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID, name: "Ada" } });
    findOne.mockResolvedValue({
      createdBy: "auth0|someone-else",
      quote: "Hidden quote",
      author: "Other",
      category: "life",
    });

    const html = renderToStaticMarkup(await pageFor(QUOTE_ID));

    expect(html).toContain("Unauthorized: You can only edit your own quotes.");
    expect(html).not.toContain("Hidden quote");
    expect(html).not.toContain("Save Changes");
  });

  it("shows the edit form filled with the owner's quote", async () => {
    getSession.mockResolvedValue({ user: { sub: OWNER_ID, name: "Ada" } });
    findOne.mockResolvedValue({
      createdBy: OWNER_ID,
      quote: "Be yourself",
      author: "Wilde",
      category: ["life"],
    });

    const html = renderToStaticMarkup(await pageFor(QUOTE_ID));

    expect(html).toContain("Be yourself");
    expect(html).toContain("Wilde");
    expect(html).toContain("life");
    expect(html).toContain("Save Changes");
    expect(html).toContain("/user/quotes/edit/success");
  });
});
