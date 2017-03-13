"use strict";

module.exports = {
  rules: {
    "no-key-assignment": require("./lib/rules/no-key-assignment"),
    "enforce-tagged-template-protection": require("./lib/rules/enforce-tagged-template-protection")
  },
  configs: {
    recommended: {
      rules: {
        "unsafe-property-assignment/no-key-assignment": ["error"],
        "unsafe-property-assignment/enforce-tagged-template-protection": ["error"]
      }
    }
  }
};
