import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useUser } = vi.hoisted(() => ({
  useUser: vi.fn(),
}));

vi.mock("@auth0/nextjs-auth0", () => ({
  useUser,
}));

vi.mock("@/components/ThemeSwitcher", () => ({
  default: () => null,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => React.createElement("a", { href, ...props }, children),
}));

import NewQuoteSuccessPage from "./page";

function expectSuccessMessage(html: string) {
  expect(html).toContain("Thank you for adding a new quote.");
  expect(html).toContain("sent to administator");
  expect(html).toContain("for review.");
}

function renderPage() {
  return renderToStaticMarkup(React.createElement(NewQuoteSuccessPage));
}

describe("NewQuoteSuccessPage", () => {
  beforeEach(() => {
    useUser.mockReset();
  });

  it("shows the success message and links to add another quote and the homepage", () => {
    useUser.mockReturnValue({
      user: { name: "Ada", picture: "https://example.com/ada.png" },
      isLoading: false,
    });

    const html = renderPage();

    expectSuccessMessage(html);
    expect(html).toContain('href="/user/quotes/new"');
    expect(html).toContain("Add another quote");
    expect(html).toContain('href="/"');
    expect(html).toContain("Go to homepage");
    expect(html).toContain('href="/auth/logout"');
    expect(html).toContain("Log out");
  });

  it("hides logout while the session is still loading", () => {
    useUser.mockReturnValue({ user: undefined, isLoading: true });

    const html = renderPage();

    expectSuccessMessage(html);
    expect(html).toContain('href="/user/quotes/new"');
    expect(html).toContain('href="/"');
    expect(html).not.toContain('href="/auth/logout"');
    expect(html).not.toContain("Log out");
  });

  it("hides logout when nobody is signed in", () => {
    useUser.mockReturnValue({ user: undefined, isLoading: false });

    const html = renderPage();

    expect(html).toContain("Add another quote");
    expect(html).toContain("Go to homepage");
    expect(html).not.toContain("Log out");
  });
});
