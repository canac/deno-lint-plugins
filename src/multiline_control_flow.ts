// Deno lint plugin that disallows single-line control-flow statements.
// Applies to: if/else, while, do-while, for, for-in, for-of.
//
// Disallowed:
//   if (cond) return;
//   while (cond) doThing();
//   for (const item of array) use(item);
//
// Required:
//   if (cond) {
//     return;
//   }

const plugin: Deno.lint.Plugin = {
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
            fix(fixer) {
              return [
                fixer.insertTextBefore(body, "{ "),
                fixer.insertTextAfter(body, " }"),
              ];
            },
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
};

export default plugin;
