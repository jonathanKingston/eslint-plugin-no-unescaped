"use strict";

module.exports = {
  meta: {
    docs: {
      description: "No key assignment",
      category: "Possible Errors"
    },
    schema: [
      {
        "type": "array"
      }
    ]
  },
  create: function(context) {
    const keyNames = context.options[0] || ["innerHTML"];
    function reportError(node, index) {
      context.report({
        node,
        message: `Unexpected string assignment of key ${keyNames[index]}.`
      });
    }
    function checkLiteral(init, node) {
      if (init) {
        switch (init.type) {
          case "TemplateLiteral":
            const templateIndex = keyNames.indexOf(init.quasis[0].value.raw);
            if (templateIndex != -1) {
              reportError(node, templateIndex);
            }
            break;
          case "Literal":
            const literalIndex = keyNames.indexOf(init.value);
            if (literalIndex != -1) {
              reportError(node, literalIndex);
            }
            break;
        }
      }
    }

    return {
      VariableDeclaration: function (node) {
        node.declarations.forEach((declaration) => {
          const init = declaration.init;
          checkLiteral(init, node);
        });
      },
      AssignmentExpression: function (node) {
        checkLiteral(node.right, node);
      }
    };
  }
};
