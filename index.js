"use strict";

module.exports = {
  rules: {
    "no-key-assignment": require("./lib/rules/no-key-assignment"),
    "enforce": require("./lib/rules/enforce")
  },
  configs: {
    recommended: {
      rules: {
        "no-unescaped/no-key-assignment": ["error"],
        "no-unescaped/enforce": ["error"]
      }
    }
  }
};
