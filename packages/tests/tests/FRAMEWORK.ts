import { existsSync } from "node:fs";
import path from "node:path";
import { describeBati } from "@batijs/tests-utils";

export const matrix = [["solid", "react", "vue"], "eslint"];

await describeBati(({ test, expect, fetch }) => {
  test("home", async () => {
    const res = await fetch("/");
    expect(res.status).toBe(200);
    expect(await res.text()).not.toContain('src="https://plausible.io');
  });

  test("auth/signin", async () => {
    const res = await fetch("/api/auth/signin");
    const text = await res.text();
    expect(text).toContain('{"is404":true}');
    expect(text).not.toContain('src="https://plausible.io');
  });

  test("telefunc", async () => {
    const res = await fetch("/_telefunc", {
      method: "post",
    });
    const text = await res.text();
    expect(text).toContain('{"is404":true}');
    expect(text).not.toContain('src="https://plausible.io');
  });

  test("Bati files are present", async () => {
    expect(existsSync(path.join(process.cwd(), ".gitignore"))).toBe(true);
  });

  test("Bati optional files are NOT present", async () => {
    expect(existsSync(path.join(process.cwd(), "renderer", "+onRenderHtml.ts"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "server", "vike-handler.ts"))).toBe(false);
    expect(existsSync(path.join(process.cwd(), "server", "create-todo-handler.ts"))).toBe(false);
  });
});
