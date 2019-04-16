---
title: Value
---

`#assert.value([selector], string)`

- **selector** - optional selector to scope the assertion to a nested element
- **string** - the expected value

The `value()` assertion mirrors the corresponding [interactor
property](/properties/value) and asserts that an element's value is equal to the
specified string. If the optional selector is omitted, and the corresponding
property has been redefined, the new property will be used to assert
against. When a selector is provided, a new scoped interactor is created to
perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.value('.email', 'email@domain.tld')

// without a scoped selector
await new Interactor('input.name')
  .assert.value('Name Namerson')

// when the corrisponding property is overridden
@interactor class FieldInteractor {
  value = value('input')
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.password-field')
  .assert.value('CorrectHorseBatteryStaple')
```
