---
title: Focusable
---

`#assert.focusable([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `focusable()` assertion mirrors the corresponding [interactor
property](/properties/focusable) and asserts that an element has a non-negative
tabindex. If the optional selector is omitted, and the corresponding property
has been redefined, the new property will be used to assert against. When a
selector is provided, a new scoped interactor is created to perform the
assertion.

``` javascript
// with a scoped selector
await new Interactor('.login-form')
  .assert.focusable('.input')

// without a scoped selector
await new Interactor('.link-to')
  .assert.focusable()

// when the corrisponding property is overridden
@interactor class FieldInteractor {
  focusable = focusable('input')
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.name-field')
  .assert.focusable()
```
