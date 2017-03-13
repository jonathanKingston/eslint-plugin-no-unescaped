"use strict";

module.exports = {
  rules: {
    "deny-key-assignment": require("./lib/rules/deny-key-assignment"),
    "enforce-tagged-template-protection": require("./lib/rules/enforce-tagged-template-protection")
  }
};
