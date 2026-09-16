type FunctionNode =
  | Deno.lint.FunctionDeclaration
  | Deno.lint.FunctionExpression;

/**
 * Deno lint plugin that prefers arrow functions over `function` declarations
 * and expressions. Auto-fixable; parameters, type parameters and return types
 * are sliced from the original source, so annotations and comments survive.
 *
 * Left alone: generators, class methods, object method shorthand, getters and
 * setters, and `export default function () {}` — rewriting those would produce
 * invalid syntax or change semantics.
 *
 * ```ts ignore
 * // Disallowed
 * function add(a, b) { return a + b; }
 * const greet = function (name) { return `hi, ${name}`; };
 *
 * // Required
 * const add = (a, b) => { return a + b; };
 * const greet = (name) => { return `hi, ${name}`; };
 * ```
 */
const plugin: Deno.lint.Plugin = {
  name: "style",
  rules: {
    "prefer-arrow-functions": {
      create(context) {
        const source = context.sourceCode;

        function buildArrow(
          fn: FunctionNode,
          body: Deno.lint.BlockStatement,
        ): string {
          const asyncPrefix = fn.async ? "async " : "";
          const generics = fn.typeParameters
            ? source.getText(fn.typeParameters)
            : "";
          // Slice the original `(params)` directly from source so type
          // annotations, comments, and trailing commas are preserved.
          const text = source.text;
          const paramsClose = text.lastIndexOf(")", body.range[0] - 1);
          let scanFrom: number;
          if (fn.typeParameters) {
            scanFrom = fn.typeParameters.range[1];
          } else if (fn.id) {
            scanFrom = fn.id.range[1];
          } else {
            scanFrom = fn.range[0] +
              (fn.async ? "async function".length : "function".length);
          }
          const paramsOpen = text.indexOf("(", scanFrom);
          const params = text.slice(paramsOpen, paramsClose + 1);
          const returnType = fn.returnType ? source.getText(fn.returnType) : "";
          const bodyText = source.getText(body);
          return `${asyncPrefix}${generics}${params}${returnType} => ${bodyText}`;
        }

        function reportDeclaration(node: Deno.lint.FunctionDeclaration) {
          if (node.generator || !node.id || !node.body) {
            return;
          }
          if (node.parent?.type === "ExportDefaultDeclaration") {
            return;
          }

          const body = node.body;
          const replacement = `const ${node.id.name} = ${
            buildArrow(node, body)
          };`;
          context.report({
            node,
            message: "Use an arrow function instead of `function`.",
            fix(fixer) {
              return fixer.replaceText(node, replacement);
            },
          });
        }

        function reportExpression(node: Deno.lint.FunctionExpression) {
          if (node.generator) {
            return;
          }
          const parent = node.parent;
          if (parent?.type === "MethodDefinition") {
            return;
          }
          if (
            parent?.type === "Property" &&
            (parent.method || parent.kind === "get" || parent.kind === "set")
          ) {
            return;
          }

          context.report({
            node,
            message: "Use an arrow function instead of `function`.",
            fix(fixer) {
              return fixer.replaceText(node, buildArrow(node, node.body));
            },
          });
        }

        return {
          FunctionDeclaration: reportDeclaration,
          FunctionExpression: reportExpression,
        };
      },
    },
  },
};

export default plugin;
