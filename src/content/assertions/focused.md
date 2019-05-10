---
title: Focused
---

`#assert.focused([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `focused()` assertion mirrors the corresponding [interactor
property](/properties/focused) and asserts that an element is the document's
active element. If the corresponding property has been redefined, a new
assertion is defined which does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.login-form')
  .focus('.input')
  .assert.focused('.input')

// without a scoped selector
await new Interactor('.link-to')
  .focus()
  .assert.focused()

// when the corresponding property is overridden
@interactor class FieldInteractor {
  focus = focus('input')
  focused = focused('input')
}

// the scoped selector argument is no longer available
await new FieldInteractor('.name-field')
  .focus()
  .assert.focused()
```
