"use strict";

const ruleName = "enforce-tagged-template-protection";
const rule = require(`../../lib/rules/${ruleName}`);
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

const setupString = `
  const beep = 12;
  const myEl = document.createElement("div");
`;

ruleTester.run(ruleName, rule, {
  valid: [
    setupString + " myEl.innerHTML = escaped`something ${beep}`;",
    setupString + " myEl.innerHTML = 'something';",
    setupString + " myEl.innerHTML = `something`;",
    setupString + " myEl.innerHTML = \"something\";",
    setupString + " myEl.innerHTML = 12;"
  ],

  invalid: [
    {
      code: setupString + " myEl.innerHTML = `${beep}`;",
      errors: [ { message: "Unexpected use of unescaped string for innerHTML." } ]
    },
    {
      code: setupString + " myEl.innerHTML = `${beep} ${beep}`;",
      errors: [ { message: "Unexpected use of unescaped string for innerHTML." } ]
    },
    {
      code: setupString + " myEl.innerHTML = 'this is me ' + beep + ' ';",
      errors: [ { message: "Unexpected use of unescaped string for innerHTML." } ]
    },
    {
      code: setupString + " myEl.innerHTML = beep;",
      errors: [ { message: "Unexpected use of unescaped string for innerHTML." } ]
    }
  ]
});
