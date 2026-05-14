/// <reference lib="deno.unstable" />
import { assertEquals } from "@std/assert";
import plugin from "./descriptive_names.ts";

function lint(source: string): Deno.lint.Diagnostic[] {
  return Deno.lint.runPlugin(plugin, "test.ts", source);
}

function ids(diagnostics: Deno.lint.Diagnostic[]): string[] {
  return diagnostics.map((diagnostic) => diagnostic.id);
}

Deno.test("flags single-letter const", () => {
  const diagnostics = lint("const x = 1;");
  assertEquals(diagnostics.length, 1);
  assertEquals(diagnostics[0].id, "names/descriptive-names");
  assertEquals(
    diagnostics[0].message,
    "`x` is too short; use a descriptive variable name.",
  );
});

Deno.test("flags single-letter let and var", () => {
  assertEquals(lint("let a = 1;").length, 1);
  assertEquals(lint("var z = 1;").length, 1);
});

Deno.test("allows multi-letter names", () => {
  assertEquals(lint("const foo = 1; let bar = 2; var baz = 3;").length, 0);
});

Deno.test("ignores two-letter names", () => {
  assertEquals(lint("const ab = 1;").length, 0);
});

Deno.test("flags function declaration param", () => {
  const diagnostics = lint("function fn(x) { return x; }");
  assertEquals(diagnostics.length, 1);
  assertEquals(
    diagnostics[0].message,
    "`x` is too short; use a descriptive variable name.",
  );
});

Deno.test("flags arrow function param", () => {
  const diagnostics = lint("const fn = (n) => n + 1;");
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags function expression param", () => {
  const diagnostics = lint("const fn = function (q) { return q; };");
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags destructured array pattern", () => {
  const diagnostics = lint("const [a, bb] = [1, 2];");
  assertEquals(diagnostics.length, 1);
  assertEquals(diagnostics[0].message.includes("`a`"), true);
});

Deno.test("flags destructured object pattern shorthand", () => {
  const diagnostics = lint("const { a } = { a: 1};");
  assertEquals(
    ids(diagnostics).filter((id) => id === "names/descriptive-names").length,
    1,
  );
});

Deno.test("flags rest element", () => {
  const diagnostics = lint("function fn(...r) { return r; }");
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags assignment pattern default", () => {
  const diagnostics = lint("function fn(x = 1) { return x; }");
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags TSParameterProperty", () => {
  const source = "class C { constructor(public x: number) {} }";
  const diagnostics = lint(source);
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags catch clause param", () => {
  const diagnostics = lint("try { f(); } catch (e) { throw e; }");
  assertEquals(diagnostics.length, 1);
  assertEquals(
    diagnostics[0].message,
    "`e` is too short; use a descriptive variable name.",
  );
});

Deno.test("flags destructured catch param", () => {
  const diagnostics = lint("try { f(); } catch ({ a }) { throw a; }");
  assertEquals(diagnostics.length, 1);
});

Deno.test("allows catch without param", () => {
  assertEquals(lint("try { f(); } catch { }").length, 0);
});

Deno.test("flags class method param", () => {
  const diagnostics = lint("class C { fn(x) { return x; } }");
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags class arrow field param", () => {
  const diagnostics = lint("class C { fn = (x) => x; }");
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags object method shorthand param", () => {
  const diagnostics = lint("const obj = { fn(x) { return x; } };");
  assertEquals(diagnostics.length, 1);
});

Deno.test("flags setter param", () => {
  const diagnostics = lint("class C { set foo(v) { this._v = v; } }");
  assertEquals(diagnostics.length, 1);
});

Deno.test("ignores digits and underscores", () => {
  assertEquals(lint("const _ = 1;").length, 0);
  assertEquals(lint("const $ = 1;").length, 0);
});
