import { assertEquals } from "@std/assert";
import plugin from "./prefer_arrow_functions.ts";
import { applyFixes } from "./test_helpers.ts";

function lint(source: string): Deno.lint.Diagnostic[] {
  return Deno.lint.runPlugin(plugin, "test.ts", source);
}

const MSG = "Use an arrow function instead of `function`.";
const RULE = "style/prefer-arrow-functions";

Deno.test("flags function declaration", () => {
  const diagnostics = lint("function add(a, b) { return a + b; }");
  assertEquals(diagnostics.length, 1);
  assertEquals(diagnostics[0].id, RULE);
  assertEquals(diagnostics[0].message, MSG);
});

Deno.test("fixes function declaration", () => {
  const source = "function add(a, b) { return a + b; }";
  assertEquals(
    applyFixes(source, lint(source)),
    "const add = (a, b) => { return a + b; };",
  );
});

Deno.test("fixes async function declaration", () => {
  const source = "async function load() { return 1; }";
  assertEquals(
    applyFixes(source, lint(source)),
    "const load = async () => { return 1; };",
  );
});

Deno.test("fixes typed function declaration", () => {
  const source = "function id<T>(value: T): T { return value; }";
  assertEquals(
    applyFixes(source, lint(source)),
    "const id = <T>(value: T): T => { return value; };",
  );
});

Deno.test("fixes function expression assigned to variable", () => {
  const source = "const f = function (a) { return a; };";
  assertEquals(
    applyFixes(source, lint(source)),
    "const f = (a) => { return a; };",
  );
});

Deno.test("fixes named function expression", () => {
  const source = "const f = function named(a) { return a; };";
  assertEquals(
    applyFixes(source, lint(source)),
    "const f = (a) => { return a; };",
  );
});

Deno.test("fixes IIFE", () => {
  const source = "(function (x) { return x; })(1);";
  assertEquals(
    applyFixes(source, lint(source)),
    "((x) => { return x; })(1);",
  );
});

Deno.test("fixes non-method object property function", () => {
  const source = "const obj = { run: function (x) { return x; } };";
  assertEquals(
    applyFixes(source, lint(source)),
    "const obj = { run: (x) => { return x; } };",
  );
});

Deno.test("skips generator function", () => {
  assertEquals(lint("function* gen() { yield 1; }").length, 0);
});

Deno.test("skips object method shorthand", () => {
  assertEquals(lint("const obj = { m() { return 1; } };").length, 0);
});

Deno.test("skips object getter", () => {
  assertEquals(lint("const obj = { get v() { return 1; } };").length, 0);
});

Deno.test("skips object setter", () => {
  assertEquals(lint("const obj = { set v(x) { void x; } };").length, 0);
});

Deno.test("skips class method", () => {
  assertEquals(lint("class C { m() { return 1; } }").length, 0);
});

Deno.test("skips export default function", () => {
  assertEquals(lint("export default function () { return 1; }").length, 0);
});

Deno.test("skips export default named function", () => {
  assertEquals(lint("export default function foo() { return 1; }").length, 0);
});

Deno.test("flags exported named function declaration", () => {
  const source = "export function foo() { return 1; }";
  assertEquals(
    applyFixes(source, lint(source)),
    "export const foo = () => { return 1; };",
  );
});

Deno.test("flags function passing through callback", () => {
  const source = "arr.map(function (x) { return x + 1; });";
  assertEquals(
    applyFixes(source, lint(source)),
    "arr.map((x) => { return x + 1; });",
  );
});

Deno.test("allows arrow function", () => {
  assertEquals(lint("const f = (a) => a + 1;").length, 0);
});

Deno.test("fixes function with rest and default params", () => {
  const source = "function f(a = 1, ...rest: number[]) { return a; }";
  assertEquals(
    applyFixes(source, lint(source)),
    "const f = (a = 1, ...rest: number[]) => { return a; };",
  );
});

Deno.test("flags nested function expression", () => {
  const source = "function outer() { return function () { return 1; }; }";
  const diagnostics = lint(source);
  assertEquals(diagnostics.length, 2);
});
