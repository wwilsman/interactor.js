---
title: Text
---

`#assert.text([selector], string)`

- **selector** - optional selector to scope the assertion to a nested element
- **string** - the expected inner text

The `text()` assertion mirrors the corresponding [interactor
property](/properties/text) and asserts that an element's innerText property is
equal to the specified string. If the corresponding property has been redefined,
a new assertion is defined which does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.email-field')
  .assert.text('label', 'Email Address:')

// without a scoped selector
await new Interactor('.title')
  .assert.text('Welcome!')

// when the corresponding property is overridden
@interactor class FieldInteractor {
  text = text('label')
}

// the scoped selector argument is no longer available
await new FieldInteractor('.name-field')
  .assert.text('Full Name')
```
