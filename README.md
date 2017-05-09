# DEPRECATED DO NOT USE

Use https://www.npmjs.com/package/eslint-plugin-no-unsanitized instead, thanks!.

**No further changes are planned here**

# eslint-plugin-no-unescaped

Checks for the following unsafe property assignement issues in code:

## no-key-assignment

```
  const me = "innerHTML";
```

This prevents key usage of variables to access unsafe properties and bypassing the `enforce` rule. This isn't fool proof either however should catch accidental usage of this capability.

Configure eslint like this:

```
  "no-unescaped/no-key-assignment": ["error", ["innerHTML"]]
```


## enforce


```
  el.innerHTML = `${bad}`;
```

This prevents assigning variables from user input into known capabilities that are dangerous to assign to.

Configure eslint like this:

```
  "no-unescaped/enforce": ["error",
    {
      html: {
        taggedTemplates: ["escaped"],
        methods: ["escapeHTML"]
      },
    },
    {
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
    }
  ]
```

The above is the default setup for the rule, the second and third argument can be ignored for the default setup.

This permits the use of tagged template strings where the function permitted is used to regulate unsafe strings and escape them.

```
  el.innerHTML = escaped`${bad}`;
```

### TODO

Currently the following is considered an error, investigate if this can safely be permitted as it is a common use-case to solve template string reuse.
```
function escapeMe(var) {
  return `Hey check this ${var}!`;
}
el.innerHTML = escapeMe(someVar);
```
