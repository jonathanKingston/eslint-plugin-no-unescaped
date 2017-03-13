"use strict";

module.exports = {
  meta: {
    docs: {
      description: "Enforce tagged template protection for important methods",
      category: "Possible Errors"
    },
    schema: [
      {
        type: "object"
      }
    ]
  },
  create: function(context) {
    const objKeys = context.options[0] || {innerHTML: ["escaped"]};
    return {
      AssignmentExpression: function (node) {
        function reportError() {
          context.report({
            node,
            message: "Unexpected use of unescaped string for innerHTML."
          });
        }
        if (node.left && node.left.type == "MemberExpression") {
          const propertyKey = node.left.property.name;
          if (propertyKey in objKeys) {
            switch (node.right.type) {
              case "TaggedTemplateExpression":
                if (objKeys[propertyKey].indexOf(node.right.tag.name) == -1) {
                  reportError();
                }
                break;
              case "TemplateLiteral":
                if (node.right.expressions.length > 0) {
                  reportError();
                }
                break;
              case "Literal":
                break;
              default:
                reportError();
            }
          }
        }
      }
    };
  }
};
