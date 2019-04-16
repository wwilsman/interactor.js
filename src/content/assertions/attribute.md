---
title: Attribute
---

`#assert.attribute([selector], attr, value)`

- **selector** - optional selector to scope the assertion to a nested element
- **attr** - the name of the attribute
- **value** - the expected value of the attribute

The `attribute()` assertion mirrors the corresponding [helper
method](/helpers/attribute) and asserts that an element's attribute is equal to
the provided value. If the optional selector is omitted, and the corresponding
method has been overridden, the new method will be used to retrieve the
attribute's actual value. When a selector is provided, a new scoped interactor
is created to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.attribute('h1', 'id', 'welcome')

// without a scoped selector
await new Interactor('.signup-form')
  .assert.attribute('method', 'POST')

// when the corrisponding method is overridden
@interactor class FieldInteractor {
  attribute(attr) {
    return this.$('input').getAttribute(attr);
  }
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.email-field')
  .assert.attribute('name', 'email')
```
