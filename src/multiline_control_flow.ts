/// <reference lib="deno.unstable" />
// Deno lint plugin that disallows single-line control-flow statements.
// Applies to: if/else, while, do-while, for, for-in, for-of.
//
// Disallowed:
//   if (cond) return;
//   while (cond) doThing();
//   for (const x of xs) use(x);
//
// Required:
//   if (cond) {
//     return;
//   }

const plugin = {
  name: "style",
  rules: {
    "multiline-control-flow": {
      create(context) {
        function check(node: Deno.lint.Statement, body: Deno.lint.Statement) {
          if (body.type === "BlockStatement") {
            return;
          }

          context.report({
            node,
            message: "Control flow bodies must be on their own line",
          });
        }

        return {
          IfStatement(node) {
            check(node, node.consequent);
            if (node.alternate && node.alternate.type !== "IfStatement") {
              check(node, node.alternate);
            }
          },
          WhileStatement(node) {
            check(node, node.body);
          },
          DoWhileStatement(node) {
            check(node, node.body);
          },
          ForStatement(node) {
            check(node, node.body);
          },
          ForInStatement(node) {
            check(node, node.body);
          },
          ForOfStatement(node) {
            check(node, node.body);
          },
        };
      },
    },
  },
} satisfies Deno.lint.Plugin;

export default plugin;
