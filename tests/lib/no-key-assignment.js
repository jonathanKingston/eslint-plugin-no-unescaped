"use strict";

const ruleName = "no-key-assignment";
const rule = require(`../../lib/rules/${ruleName}`);
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });
ruleTester.run(ruleName, rule, {
  valid: [
    "const string0 = `innerText`;",
    "let string0; string0 = \"innerText\";",
    "let string0; string0 = `innerText`;"
  ],

  invalid: [
    {
      code: "const string1 = 'innerHTML';",
      errors: [ { message: "Unexpected string assignment of key innerHTML." } ]
    },
    {
      code: "const string1 = 'outerHTML';",
      errors: [ { message: "Unexpected string assignment of key outerHTML." } ]
    },
    {
      code: "const string1 = 'insertAdjacentHTML';",
      errors: [ { message: "Unexpected string assignment of key insertAdjacentHTML." } ]
    },
    {
      code: "const string1 = 'writeln';",
      errors: [ { message: "Unexpected string assignment of key writeln." } ]
    },
    {
      code: "const string1 = 'write';",
      errors: [ { message: "Unexpected string assignment of key write." } ]
    },
    {
      code: "const string1 = 'createContextualFragment';",
      errors: [ { message: "Unexpected string assignment of key createContextualFragment." } ]
    },
    {
      code: "let string0; string0 = \"innerHTML\";",
      errors: [ { message: "Unexpected string assignment of key innerHTML." } ]
    },
    {
      code: "let string0; string0 = `innerHTML`",
      errors: [ { message: "Unexpected string assignment of key innerHTML." } ]
    },
    {
      code: "var string2 = `innerHTML`",
      errors: [ { message: "Unexpected string assignment of key innerHTML." } ]
    }
  ]
});
