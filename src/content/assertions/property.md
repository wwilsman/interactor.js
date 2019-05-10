---
title: Property
---

`#assert.property([selector], prop, value)`

- **selector** - optional selector to scope the assertion to a nested element
- **prop** - the name of the property
- **value** - the expected value of the property

The `property()` assertion mirrors the corresponding [helper
method](/helpers/property) and asserts that an element's property is equal to
the provided value.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.property('.option-1', 'selected', true)

// without a scoped selector
await new Interactor('.checkbox')
  .assert.property('checked', false)
```
