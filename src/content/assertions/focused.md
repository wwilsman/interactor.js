---
title: Focused
---

`#assert.focused([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `focused()` assertion mirrors the corresponding [interactor
property](/properties/focused) and asserts that an element is the document's
active element. If the optional selector is omitted, and the corresponding
property has been redefined, the new property will be used to assert
against. When a selector is provided, a new scoped interactor is created to
perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.login-form')
  .focus('.input')
  .assert.focused('.input')

// without a scoped selector
await new Interactor('.link-to')
  .focus()
  .assert.focused()

// when the corrisponding property is overridden
@interactor class FieldInteractor {
  focus = focus('input')
  focused = focused('input')
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.name-field')
  .focus()
  .assert.focused()
```
