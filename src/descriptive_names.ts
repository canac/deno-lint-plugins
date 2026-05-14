// Deno lint plugin that disallows single-letter variable names.

const plugin: Deno.lint.Plugin = {
  name: "names",
  rules: {
    "descriptive-names": {
      create(context) {
        function check(name: string, node: Deno.lint.Node) {
          if (/^[a-zA-Z]$/.test(name)) {
            context.report({
              node,
              message:
                `\`${name}\` is too short; use a descriptive variable name.`,
            });
          }
        }

        function checkParam(param: Deno.lint.Parameter) {
          if (param.type === "TSParameterProperty") {
            checkParam(param.parameter);
          } else {
            checkPattern(param);
          }
        }

        function checkPattern(pattern: Deno.lint.Node) {
          if (pattern.type === "Identifier") {
            check(pattern.name, pattern);
          } else if (pattern.type === "ArrayPattern") {
            for (const element of pattern.elements) {
              if (element) {
                checkPattern(element);
              }
            }
          } else if (pattern.type === "ObjectPattern") {
            for (const property of pattern.properties) {
              if (property.type === "Property") {
                checkPattern(property.value);
              } else if (property.type === "RestElement") {
                checkPattern(property.argument);
              }
            }
          } else if (pattern.type === "RestElement") {
            checkPattern(pattern.argument);
          } else if (pattern.type === "AssignmentPattern") {
            checkPattern(pattern.left);
          }
        }

        return {
          VariableDeclarator(node) {
            checkPattern(node.id);
          },
          FunctionDeclaration(node) {
            for (const param of node.params) {
              checkParam(param);
            }
          },
          FunctionExpression(node) {
            for (const param of node.params) {
              checkParam(param);
            }
          },
          ArrowFunctionExpression(node) {
            for (const param of node.params) {
              checkParam(param);
            }
          },
          CatchClause(node) {
            if (node.param) {
              checkPattern(node.param);
            }
          },
        };
      },
    },
  },
};

export default plugin;
