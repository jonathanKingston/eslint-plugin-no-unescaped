# eslint-plugin-unsafe-property-assignment

Checks for the following unsafe property assignement issues in code:

## no-key-assignment

```
  const me = "innerHTML";
```

This prevents key usage of variables to access unsafe properties and bypassing the `enforce-tagged-template-protection` rule. This isn't fool proof either however should catch accidental usage of this capability.

Configure eslint like this:

```
  "unsafe-property-assignment/no-key-assignment": ["error", ["innerHTML"]]
```


## enforce-tagged-template-protection


```
  el.innerHTML = `${bad}`;
```

This prevents assigning variables from user input into known capabilities that are dangerous to assign to.

Configure eslint like this:

```
  "unsafe-property-assignment/enforce-tagged-template-protection": ["error", {innerHTML: ["escaped"]}]
```

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
