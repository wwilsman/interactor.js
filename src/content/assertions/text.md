---
title: Text
---

`#assert.text([selector], string)`

- **selector** - optional selector to scope the assertion to a nested element
- **string** - the expected inner text

The `text()` assertion mirrors the corresponding [interactor
property](/properties/text) and asserts that an element's innerText property is
equal to the specified string. If the optional selector is omitted, and the
corresponding property has been redefined, the new property will be used to
assert against. When a selector is provided, a new scoped interactor is created
to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.email-field')
  .assert.text('label', 'Email Address:')

// without a scoped selector
await new Interactor('.title')
  .assert.text('Welcome!')

// when the corrisponding property is overridden
@interactor class FieldInteractor {
  text = text('label')
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.name-field')
  .assert.text('Full Name')
```
