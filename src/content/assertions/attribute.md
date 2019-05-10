---
title: Attribute
---

`#assert.attribute([selector], attr, value)`

- **selector** - optional selector to scope the assertion to a nested element
- **attr** - the name of the attribute
- **value** - the expected value of the attribute

The `attribute()` assertion mirrors the corresponding [helper
method](/helpers/attribute) and asserts that an element's attribute is equal to
the provided value.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.attribute('h1', 'id', 'welcome')

// without a scoped selector
await new Interactor('.signup-form')
  .assert.attribute('method', 'POST')
```
