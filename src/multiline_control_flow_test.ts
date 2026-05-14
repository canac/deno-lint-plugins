/// <reference lib="deno.unstable" />
import { assertEquals } from "@std/assert";
import plugin from "./multiline_control_flow.ts";

function lint(source: string): Deno.lint.Diagnostic[] {
  return Deno.lint.runPlugin(plugin, "test.ts", source);
}

const MSG = "Control flow bodies must be on their own line";

Deno.test("flags single-line if", () => {
  const diagnostics = lint("if (cond) return;");
  assertEquals(diagnostics.length, 1);
  assertEquals(diagnostics[0].id, "style/multiline-control-flow");
  assertEquals(diagnostics[0].message, MSG);
});

Deno.test("allows block if", () => {
  assertEquals(lint("if (cond) { return; }").length, 0);
});

Deno.test("flags single-line else", () => {
  const diagnostics = lint("if (cond) { a(); } else b();");
  assertEquals(diagnostics.length, 1);
});

Deno.test("allows else-if chain", () => {
  const source = "if (a) { x(); } else if (b) { y(); } else { z(); }";
  assertEquals(lint(source).length, 0);
});

Deno.test("flags both branches when both are bare", () => {
  const diagnostics = lint("if (cond) a(); else b();");
  assertEquals(diagnostics.length, 2);
});

Deno.test("flags single-line while", () => {
  assertEquals(lint("while (cond) doThing();").length, 1);
});

Deno.test("allows block while", () => {
  assertEquals(lint("while (cond) { doThing(); }").length, 0);
});

Deno.test("flags single-line do-while", () => {
  assertEquals(lint("do tick(); while (cond);").length, 1);
});

Deno.test("flags single-line for", () => {
  assertEquals(lint("for (let i = 0; i < 3; i++) use(i);").length, 1);
});

Deno.test("flags single-line for-in", () => {
  assertEquals(lint("for (const k in obj) use(k);").length, 1);
});

Deno.test("flags single-line for-of", () => {
  assertEquals(lint("for (const v of arr) use(v);").length, 1);
});

Deno.test("allows block for-of", () => {
  assertEquals(lint("for (const v of arr) { use(v); }").length, 0);
});
