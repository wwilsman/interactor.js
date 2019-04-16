---
title: Property
---

`#assert.property([selector], prop, value)`

- **selector** - optional selector to scope the assertion to a nested element
- **prop** - the name of the property
- **value** - the expected value of the property

The `property()` assertion mirrors the corresponding [helper
method](/helpers/property) and asserts that an element's property is equal to
the provided value. If the optional selector is omitted, and the corresponding
method has been overridden, the new method will be used to retrieve the
property's actual value. When a selector is provided, a new scoped interactor is
created to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.property('.option-1', 'selected', true)

// without a scoped selector
await new Interactor('.checkbox')
  .assert.property('checked', false)

// when the corrisponding method is overridden
@interactor class FieldInteractor {
  property(prop) {
    return this.$('input')[prop];
  }
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.pass-field')
  .assert.property('name', 'password')
```
