---
title: Value
---

`#assert.value([selector], string)`

- **selector** - optional selector to scope the assertion to a nested element
- **string** - the expected value

The `value()` assertion mirrors the corresponding [interactor
property](/properties/value) and asserts that an element's value is equal to the
specified string. If the corresponding property has been redefined, a new
assertion is defined which does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.value('.email', 'email@domain.tld')

// without a scoped selector
await new Interactor('input.name')
  .assert.value('Name Namerson')

// when the corresponding property is overridden
@interactor class FieldInteractor {
  value = value('input')
}

// the scoped selector argument is no longer available
await new FieldInteractor('.password-field')
  .assert.value('CorrectHorseBatteryStaple')
```
