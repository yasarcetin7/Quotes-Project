import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";

const { getSession, find, toArray, collection, getDb, redirect } = vi.hoisted(
  () => ({
    getSession: vi.fn(),
    find: vi.fn(),
    toArray: vi.fn(),
    collection: vi.fn(),
    getDb: vi.fn(),
    redirect: vi.fn((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    }),
  }),
);

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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/components/ThemeSwitcher", () => ({
  default: () => null,
}));

import LikedQuotesPage from "./page";

const USER_ID = "auth0|reader";
const FIRST_ID = "507f1f77bcf86cd799439011";
const SECOND_ID = "507f1f77bcf86cd799439012";

function renderPage() {
  return LikedQuotesPage();
}

describe("LikedQuotesPage", () => {
  beforeEach(() => {
    getSession.mockReset();
    find.mockReset();
    toArray.mockReset();
    collection.mockReset();
    getDb.mockReset();
    redirect.mockReset();

    find.mockImplementation(() => ({ toArray }));
    collection.mockImplementation(() => ({ find }));
    getDb.mockImplementation(async () => ({ collection }));
    redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it("sends a signed-out visitor to login and does not show any quotes", async () => {
    getSession.mockResolvedValue(null);

    await expect(renderPage()).rejects.toThrow("REDIRECT:/auth/login");
    expect(getDb).not.toHaveBeenCalled();
  });

  it("shows that nothing was liked when the user has no liked quotes", async () => {
    getSession.mockResolvedValue({
      user: { sub: USER_ID, name: "Ada" },
    });
    toArray.mockResolvedValue([]);

    const html = renderToStaticMarkup(await renderPage());

    expect(collection).toHaveBeenCalledWith("quotes");
    expect(find).toHaveBeenCalledWith({
      adminApproved: true,
      likedBy: USER_ID,
    });
    expect(html).toContain("Liked Quotes");
    expect(html).toContain("liked any of the quotes yet.");
    expect(html).not.toContain("Remove from list");
    expect(html).not.toContain("Be yourself");
  });

  it("shows every approved quote the user has liked", async () => {
    getSession.mockResolvedValue({
      user: { sub: USER_ID, name: "Ada", picture: "https://example.com/ada.png" },
    });
    toArray.mockResolvedValue([
      {
        _id: new ObjectId(FIRST_ID),
        quote: "Be yourself",
        author: "Wilde",
        category: "life",
        adminApproved: true,
        likedBy: [USER_ID],
      },
      {
        _id: new ObjectId(SECOND_ID),
        quote: "Stay curious",
        author: "Ada",
        category: ["science", "work"],
        adminApproved: true,
        likedBy: [USER_ID, "auth0|someone-else"],
      },
    ]);

    const html = renderToStaticMarkup(await renderPage());

    expect(find).toHaveBeenCalledWith({
      adminApproved: true,
      likedBy: USER_ID,
    });
    expect(html).toContain("Be yourself");
    expect(html).toContain("Wilde");
    expect(html).toContain("life");
    expect(html).toContain("Stay curious");
    expect(html).toContain("Ada");
    expect(html).toContain("science, work");
    expect(html).toContain("Remove from list");
    expect(html).toContain('aria-label="Remove quote from liked list"');
    expect(html).not.toContain("liked any of the quotes yet.");
  });
});
