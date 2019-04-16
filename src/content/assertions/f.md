---
title: F
---

`#assert.f(formatString)`

- **formatString** - the format of an error message that might be throw

The `f()` method of assertions formats any error messages associated with a
group of assertions. The method can be called at any point in the group to set
the error message format. If `validate()` or `remains()` is called, a new group
is created and the default format is restored.

Within the `formatString` two replacements are done to provide better error
messages. The first replaces `%s` with the scope of the interactor. If an
interactor does not have a scope associated with it the interactor's class name
is used instead. The second replacement is `%e` which will become the failed
assertion's error message.

For example, the below code is how the `click()` action is implemented:

``` javascript
function click(selector) {
  return scoped(selector)
  // perform clickable validation
    .assert.focusable()
    .assert.not.disabled()
    .assert.f('Failed to click %s: %e')
  // invoke the native DOM method
    .do(element => {
      element.click();
    });
}
```

In the example above, the thrown error message might be one of the following
possible messages:

- `Failed to click "button": disabled`
- `Failed to click CustomInteractor: not focusable, tabindex must be greater than -1`
