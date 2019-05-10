---
title: Focusable
---

`#assert.focusable([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `focusable()` assertion mirrors the corresponding [interactor
property](/properties/focusable) and asserts that an element has a non-negative
tabindex. If the corresponding property has been redefined, a new assertion is
defined which does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.login-form')
  .assert.focusable('.input')

// without a scoped selector
await new Interactor('.link-to')
  .assert.focusable()

// when the corresponding property is overridden
@interactor class FieldInteractor {
  focusable = focusable('input')
}

// the scoped selector argument is no longer available
await new FieldInteractor('.name-field')
  .assert.focusable()
```
