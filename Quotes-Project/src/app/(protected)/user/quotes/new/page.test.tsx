/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { getSession, insertOne, collection, getDb, redirect, useUser } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    insertOne: vi.fn(),
    collection: vi.fn(),
    getDb: vi.fn(),
    redirect: vi.fn(),
    useUser: vi.fn(),
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

vi.mock("@auth0/nextjs-auth0/client", () => ({
  useUser,
}));

vi.mock("@/components/ThemeSwitcher", () => ({
  default: () => null,
}));

import AddNewQuotePage from "./page";

const USER_ID = "auth0|writer";

function authorField() {
  return screen.getByRole("textbox", { name: "Author" });
}

function quoteField() {
  return screen.getByRole("textbox", { name: "Quote" });
}

function categoryField() {
  return screen.getByRole("combobox", { name: "Category" });
}

async function chooseLife(user: ReturnType<typeof userEvent.setup>) {
  await user.click(categoryField());
  await user.click(await screen.findByRole("option", { name: "Life" }));
}

describe("AddNewQuotePage", () => {
  beforeAll(() => {
    if (!globalThis.ResizeObserver) {
      globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }

    const element = HTMLElement.prototype as HTMLElement & {
      hasPointerCapture?: (pointerId: number) => boolean;
      setPointerCapture?: (pointerId: number) => void;
      releasePointerCapture?: (pointerId: number) => void;
    };
    element.hasPointerCapture ??= () => false;
    element.setPointerCapture ??= () => {};
    element.releasePointerCapture ??= () => {};
    element.scrollIntoView = () => {};
  });

  beforeEach(() => {
    getSession.mockReset();
    insertOne.mockReset();
    collection.mockReset();
    getDb.mockReset();
    redirect.mockReset();
    useUser.mockReset();

    useUser.mockReturnValue({
      user: { name: "Ada", picture: "https://example.com/ada.png" },
      isLoading: false,
    });
    getSession.mockResolvedValue({ user: { sub: USER_ID } });
    insertOne.mockResolvedValue({ insertedId: "new-quote" });
    collection.mockImplementation(() => ({ insertOne }));
    getDb.mockImplementation(async () => ({ collection }));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("starts empty and keeps the author, quote, and category that are filled in", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    expect(authorField()).toHaveProperty("value", "");
    expect(quoteField()).toHaveProperty("value", "");
    expect(categoryField().textContent).toContain("Select a category...");
    expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();

    await user.type(authorField(), "Wilde");
    await user.type(quoteField(), "Be yourself");
    await chooseLife(user);

    expect(authorField()).toHaveProperty("value", "Wilde");
    expect(quoteField()).toHaveProperty("value", "Be yourself");
    expect(categoryField().textContent).toContain("Life");
  });

  it("shows a zod warning when the author name is too short", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    await user.type(authorField(), "A");
    await user.tab();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Author name should be at least 2 characters long",
    );
  });

  it("shows a zod warning when the author name contains a number", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    await user.type(authorField(), "A1");
    await user.tab();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Author name cannot contain numbers",
    );
  });

  it("shows a zod warning when the author name is too long", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    await user.type(authorField(), "A".repeat(31));
    await user.tab();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Author name should be 50 characters long maximum. Please try a shorter name.",
    );
  });

  it("shows a zod warning when the quote is too short", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    await user.type(quoteField(), "Short");
    await user.tab();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Quote should be at least 6 characters long",
    );
  });

  it("does not warn when the author and quote pass the zod rules", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    await user.type(authorField(), "Wilde");
    await user.tab();
    await user.type(quoteField(), "Be yourself");
    await user.tab();

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows the category warning and does not save when that field is left empty", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    await user.type(authorField(), "Wilde");
    await user.type(quoteField(), "Be yourself");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Please select a category",
    );
    expect(insertOne).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("saves the filled quote and opens the success page", async () => {
    const user = userEvent.setup();
    render(<AddNewQuotePage />);

    await user.type(authorField(), "Wilde");
    await user.type(quoteField(), "Be yourself");
    await chooseLife(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(insertOne).toHaveBeenCalledTimes(1);
    });

    expect(collection).toHaveBeenCalledWith("quotes");
    expect(insertOne.mock.calls[0][0]).toMatchObject({
      author: "Wilde",
      quote: "Be yourself",
      category: "life",
      createdBy: USER_ID,
      adminApproved: false,
      likedBy: [],
    });
    expect(redirect).toHaveBeenCalledWith("/user/quotes/new/success");
  });
});
