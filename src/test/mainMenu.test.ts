import { describe, it, expect } from "vitest";
import { defaultMenuConfig } from "@/hooks/useSiteSettings";

/**
 * The shop's main menu must always offer a way to reach the blog.
 * Rules covered:
 *   - the default menu contains a "Blog" entry
 *   - that entry points at the /blog route (the route registered in App.tsx)
 *   - it is visible, so the navbar renders it without extra admin action
 *   - no duplicate Blog entry sneaks in
 */
describe("shop main menu", () => {
  const blogItems = defaultMenuConfig.items.filter((item) => item.url === "/blog");

  it("contains exactly one Blog link", () => {
    expect(blogItems).toHaveLength(1);
  });

  it("labels the blog link 'Blog' and shows it", () => {
    expect(blogItems[0]).toEqual({ label: "Blog", url: "/blog", visible: true });
  });

  it("keeps the other main sections reachable", () => {
    const urls = defaultMenuConfig.items.map((item) => item.url);
    expect(urls).toEqual(expect.arrayContaining(["/", "/shop", "/about", "/contact"]));
  });
});
