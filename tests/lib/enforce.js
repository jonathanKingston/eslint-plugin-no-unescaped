"use strict";

const ruleName = "enforce";
const rule = require(`../../lib/rules/${ruleName}`);
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

const setupString = `
  const beep = 12;
  const myEl = document.createElement("div");
`;

const defaultSetup = {
  html: {
    taggedTemplates: ["Sanitizer.escapeHTML"],
    methods: ["Sanitizer.unwrapSafeHTML"]
  },
};
const other = {
  properties: {
    innerHTML: {
      taggedTemplateProtection: ["Sanitizer.escapeHTML"],
      safeMethods: ["Sanitizer.unwrapSafeHTML"]
    },
    outerHTML: {
      safeMethods: ["Sanitizer.unwrapSafeHTML"]
    }
  },
  methods: {
    insertAdjacentHTML: {
      properties: [1],
      taggedTemplateProtection: ["Sanitizer.escapeHTML"],
      safeMethods: ["Sanitizer.unwrapSafeHTML"]
    },
    writeln: {
      properties: [0],
      taggedTemplateProtection: ["Sanitizer.escapeHTML"],
      safeMethods: ["Sanitizer.unwrapSafeHTML"]
    }
  }
};

ruleTester.run(ruleName, rule, {
  valid: [
    setupString + " myEl.innerHTML = escaped`something ${beep}`;",
    setupString + " myEl.innerHTML = 'something';",
    setupString + " myEl.innerHTML = `something`;",
    setupString + " myEl.innerHTML = \"something\";",
    setupString + " myEl.innerHTML = 12;",
    "a.innerHTML = '';",
    "c.innerHTML = ``;",
    {
      code: "g.innerHTML = Sanitizer.escapeHTML``;",
      options: [defaultSetup]
    },
    {
      code: "h.innerHTML = Sanitizer.escapeHTML`foo`;",
      options: [defaultSetup]
    },
    {
      code: "i.innerHTML = Sanitizer.escapeHTML`foo${bar}baz`;",
      options: [defaultSetup]
    },
    // tests for innerHTML update (+= operator)
    "a.innerHTML += '';",
    "b.innerHTML += \"\";",
    "c.innerHTML += ``;",
    {
      code: "g.innerHTML += Sanitizer.escapeHTML``;",
      options: [defaultSetup]
    },
    {
      code: "h.innerHTML += Sanitizer.escapeHTML`foo`;",
      options: [defaultSetup]
    },
    {
      code: "i.innerHTML += Sanitizer.escapeHTML`foo${bar}baz`;",
      options: [defaultSetup]
    },
    {
      code: "i.innerHTML += Sanitizer.unwrapSafeHTML(htmlSnippet)",
      options: [defaultSetup]
    },
    {
      code: "i.outerHTML += Sanitizer.unwrapSafeHTML(htmlSnippet)",
      options: [defaultSetup]
    },
    // testing unwrapSafeHTML spread
    {
      code: "this.imeList.innerHTML = Sanitizer.unwrapSafeHTML(...listHtml);",
      options: [defaultSetup]
    },
    // tests for insertAdjacentHTML calls
    "n.insertAdjacentHTML('afterend', 'meh');",
    "n.insertAdjacentHTML('afterend', `<br>`);",
    {
      code: "n.insertAdjacentHTML('afterend', Sanitizer.escapeHTML`${title}`);",
      options: [defaultSetup]
    },
    // (binary) expressions
    "x.innerHTML = `foo`+`bar`;",
    "y.innerHTML = '<span>' + 5 + '</span>';",
    // document.write/writeln
    "document.write('lulz');",
    "document.write();",
    {
      code: "document.writeln(Sanitizer.escapeHTML`<em>${evil}</em>`);",
      options: [defaultSetup]
    },
    // template string expression tests
    "u.innerHTML = `<span>${'lulz'}</span>`;",
    "v.innerHTML = `<span>${'lulz'}</span>${55}`;",
    "w.innerHTML = `<span>${'lulz'+'meh'}</span>`;",
  ],

  invalid: [
    {
      code: setupString + " myEl.innerHTML = `${beep}`;",
      errors: [ { message: "Unexpected use of unescaped assignment to innerHTML" } ]
    },
    {
      code: setupString + " myEl.innerHTML = `${beep} ${beep}`;",
      errors: [ { message: "Unexpected use of unescaped assignment to innerHTML" } ]
    },
    {
      code: setupString + " myEl.innerHTML = 'this is me ' + beep + ' ';",
      errors: [ { message: "Unexpected use of unescaped assignment to innerHTML" } ]
    },
    {
      code: setupString + " myEl.innerHTML = beep;",
      errors: [ { message: "Unexpected use of unescaped assignment to innerHTML" } ]
    },

    /* XXX Do NOT change the error strings below without review from freddy:
     * The strings are optimized for SEO and understandability.
     * The developer can search for them and will find this MDN article:
     *  https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_Automation
     */

    // innerHTML examples
    {
        code: "m.innerHTML = htmlString;",
        errors: [
            { message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression" }
        ]
    },
    {
        code: "a.innerHTML += htmlString;",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ]
    },
    {
        code: "a.innerHTML += template.toHtml();",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ]
    },
    {
        code: "m.outerHTML = htmlString;",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to outerHTML",
                type: "AssignmentExpression"
            }
        ]
    },
    {
        code: "t.innerHTML = `<span>${name}</span>`;",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ],
        parserOptions: { ecmaVersion: 6 }
    },
    {
        code: "t.innerHTML = `<span>${'foobar'}</span>${evil}`;",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ],
    },
    // insertAdjacentHTML examples
    {
        code: "node.insertAdjacentHTML('beforebegin', htmlString);",
        errors: [
            {
                message: "Unexpected use of unescaped call to node.insertAdjacentHTML at index 1",
                type: "CallExpression"
            }
        ]
    },
    {
        code: "node.insertAdjacentHTML('beforebegin', template.getHTML());",
        errors: [
            {
                message: "Unexpected use of unescaped call to node.insertAdjacentHTML at index 1",
                type: "CallExpression"
            }
        ]
    },
    // (binary) expressions
    {
        code: "node.innerHTML = '<span>'+ htmlInput;",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ]
    },
    {
        code: "node.innerHTML = '<span>'+ htmlInput + '</span>';",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ]
    },
    // document.write / writeln
    {
        code: "document.write('<span>'+ htmlInput + '</span>');",
        errors: [
            {
                message: "Unexpected use of unescaped call to document.write at index 0",
                type: "CallExpression"
            }
        ]
    },
    {
        code: "document.writeln(evil);",
        errors: [
            {
                message: "Unexpected use of unescaped call to document.writeln at index 0",
                type: "CallExpression"
            }
        ]
    },
    // bug https://bugzilla.mozilla.org/show_bug.cgi?id=1198200
    {
        code: "title.innerHTML = _('WB_LT_TIPS_S_SEARCH'," +
        " {value0:engine});",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ]
    },
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1192595
    {
        code: "x.innerHTML = Sanitizer.escapeHTML(evil)",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ]
    },
    {
        code: "x.innerHTML = Sanitizer.escapeHTML(`evil`)",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ],
    },
    {
        code: "y.innerHTML = ((arrow_function)=>null)`some HTML`",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ],
    },
    {
        code: "y.innerHTML = ((arrow_function)=>null)`some HTML`",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ],
    },
    {
        code: "y.innerHTML = ((arrow_function)=>badment)`some HTML`",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ],
    },
    {
        code: "y.innerHTML = ((arrow_function)=>null)`some HTML`",
        errors: [
            {
                message: "Unexpected use of unescaped assignment to innerHTML",
                type: "AssignmentExpression"
            }
        ],
    }
  ]
});
