"use strict";

module.exports = {
  meta: {
    docs: {
      description: "Enforce tagged template protection for important attributes",
      category: "Possible Errors"
    },
    schema: [
      {
        type: "object"
      }
    ]
  },
  create: function(context) {
    const safeLinters = context.options[0] || {
      html: {
        taggedTemplates: ["escaped"],
        methods: ["escapeHTML"]
      }
    };
    const checkSetup = context.options[1] || {
      properties: {
        innerHTML: {
          type: "html"
        },
        outerHTML: {
          type: "html"
        },
      },
      methods: {
        insertAdjacentHTML: {
          type: "html",
          properties: [1]
        },
        writeln: {
          type: "html",
          properties: [0]
        },
        write: {
          type: "html",
          properties: [0]
        },
        createContextualFragment: {
          type: "html",
          properties: [0]
        }
      }
    };
    function getLintersForType(type, key) {
      let parentObj;
      switch (type) {
        case "property":
          parentObj = checkSetup.properties;
          break;
        case "method":
          parentObj = checkSetup.methods;
          break;
        default:
          throw new Error("unknown type for getLintersForType");
      }
      return safeLinters[parentObj[key].type];
    }
    function getIdentifierName(subNode) {
      let identifierName;
      switch (subNode.type) {
        case "Identifier":
          // identifierName like escape
          identifierName = subNode.name;
          break;
        case "MemberExpression":
          // identifierName like obj.name
          identifierName = sourceCode.getText(subNode);
          break;
        case "ArrowFunctionExpression":
          return;
        default:
          throw new Error(`unsupported type ${subNode.type} in getIdentifierName`);
          break;
      }
      return identifierName;
    }
    function isSafeNode(node, type, key) {
      let isSafeCheck = false;
      let types = getLintersForType(type, key);
      switch (node.type) {
        case "TaggedTemplateExpression":
          const identifierName = getIdentifierName(node.tag);
          // If our identifier is the types list it is safe
          if (types.taggedTemplates &&
              types.taggedTemplates.includes(identifierName)) {
            isSafeCheck = true;
          }
          break;
        case "BinaryExpression":
          if (isSafeNode(node.left, type, key) &&
            isSafeNode(node.right, type, key)) {
            isSafeCheck = true;
          }
          break;
        case "TemplateLiteral":
          if (node.expressions.length === 0) {
            isSafeCheck = true;
          } else {
            let childrenSafe = true;
            // Check all template literals to ensure they are safe
            node.expressions.forEach((expressionNode) => {
              if (!isSafeNode(expressionNode, type, key)) {
                childrenSafe = false;
              }
            });
            isSafeCheck = childrenSafe;
          }
          break;
        case "CallExpression":
          isSafeCheck = false;
          const methodIdentifierName = getIdentifierName(node.callee);
          // If our identifier is the types list it is safe
          if (types.methods &&
              types.methods.includes(methodIdentifierName)) {
            isSafeCheck = true;
          }
          break;
        case "Literal":
          isSafeCheck = true;
          break;
        case "Identifier":
        // Vars are unsafe
        default:
          isSafeCheck = false;
      }
      return isSafeCheck;
    }
    const sourceCode = context.getSourceCode();
    function genericError(message, node) {
      context.report({
        node,
        message
      });
    }
    return {
      AssignmentExpression(node) {
        function reportError(propertyKey) {
          context.report({
            node,
            message: `Unexpected use of unescaped assignment to ${propertyKey}`
          });
        }
        if (node.left && node.left.type == "MemberExpression") {
          const propertyKey = node.left.property.name;
          if (propertyKey in checkSetup.properties) {
            if (!isSafeNode(node.right, "property", propertyKey)) {
              reportError(propertyKey);
            }
          }
        }
      },
      CallExpression(node) {
        if (!checkSetup.methods) {
          return;
        }

        function reportError(methodName, index) {
          context.report({
            node,
            message: `Unexpected use of unescaped call to ${methodName} at index ${index}`
          });
        }

        let methodName;
        let objectName;
        switch (node.callee.type) {
          case "Identifier":
            methodName = node.callee.name;
            break;
          case "MemberExpression":
            methodName = node.callee.property.name;
            objectName = node.callee.object.name;
            break;
          default:
            genericError("Unexpected type passed to call expression", node);
        }
        let codeName = methodName;
        if (objectName) {
          codeName = `${objectName}.${codeName}`;
        }
        if (methodName in checkSetup.methods) {
          const methodSetup = checkSetup.methods[methodName];
          // Ensure we don't have a native method like toString here...
          if ("properties" in methodSetup) {
            methodSetup.properties.forEach((index) => {
              const argument = node.arguments[index];
              if (argument && !isSafeNode(argument, "method", methodName)) {
                reportError(codeName, index);
              }
            });
          }
        }
      }
    };
  }
};
