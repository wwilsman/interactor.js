---
title: Disabled
---

`#assert.disabled([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `disabled()` assertion mirrors the corresponding [interactor
property](/properties/disabled) and asserts that an element is disabled. If the
optional selector is omitted, and the corresponding property has been redefined,
the new property will be used to assert against. When a selector is provided, a
new scoped interactor is created to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.disabled('.submit')

// without a scoped selector
await new Interactor('.signup-form .submit')
  .assert.disabled()

// when the corrisponding property is overridden
@interactor class FieldInteractor {
  disabled = matches('.is-disabled')
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.email-field')
  .assert.disabled()
```
