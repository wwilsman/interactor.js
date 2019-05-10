---
title: Disabled
---

`#assert.disabled([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `disabled()` assertion mirrors the corresponding [interactor
property](/properties/disabled) and asserts that an element is disabled. If the
corresponding property has been redefined, a new assertion is defined which does
not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.disabled('.submit')

// without a scoped selector
await new Interactor('.signup-form .submit')
  .assert.disabled()

// when the corresponding property is overridden
@interactor class FieldInteractor {
  disabled = matches('.is-disabled')
}

// the scoped selector argument is no longer available
await new FieldInteractor('.email-field')
  .assert.disabled()
```
