# deno-lint-plugins

A small collection of
[Deno lint](https://docs.deno.com/runtime/reference/lint_plugins/) plugins.

## Plugins

### `names/descriptive-names`

Disallows single-letter identifiers in variable declarations, function
parameters, destructuring patterns, and `catch` clauses.

```ts
// Bad
const x = 1;
items.map((i) => i.name);

// Good
const count = 1;
items.map((item) => item.name);
```

### `style/multiline-control-flow`

Requires `if` / `else` / `while` / `do-while` / `for` / `for-in` / `for-of`
bodies to be wrapped in a block. Auto-fixable.

```ts
// Bad
if (done) return;
for (const item of array) use(item);

// Good
if (done) {
  return;
}
```

### `style/prefer-arrow-functions`

Disallows `function` declarations and expressions in favor of arrow functions.
Auto-fixable. Skips generators, class/object methods, and getters/setters.

```ts
// Bad
function add(a, b) {
  return a + b;
}
const greet = function (name) {
  return `hi, ${name}`;
};

// Good
const add = (a, b) => {
  return a + b;
};
const greet = (name) => {
  return `hi, ${name}`;
};
```

## Usage

Reference the plugins from your `deno.json` via JSR:

```json
{
  "lint": {
    "plugins": [
      "jsr:@canac/deno-lint-plugins/descriptive-names",
      "jsr:@canac/deno-lint-plugins/multiline-control-flow",
      "jsr:@canac/deno-lint-plugins/prefer-arrow-functions"
    ]
  }
}
```

Then run:

```sh
deno lint
```

## Development

```sh
deno test
```
