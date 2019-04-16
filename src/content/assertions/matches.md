---
title: Matches
---

`#assert.matches([selector], match)`

- **selector** - optional selector to scope the assertion to a nested element
- **match** - selector string to match against

The `matches()` assertion mirrors the corresponding [helper
method](/helpers/matches) and asserts that an element matches some selector. If
the optional selector is omitted, and the corresponding method has been
overridden, the new method will be used to determine if there is a match. When a
selector is provided, a new scoped interactor is created to perform the
assertion.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.matches('.submit', '.primary')

// without a scoped selector
await new Interactor('.page')
  .assert.matches('.home-page')

// when the corrisponding method is overridden
@interactor class FieldInteractor {
  type = attribute('input', 'type')
  matches(type) {
    return this.type === type;
  }
}

// if given a selector, the default behavior would be used
await new FieldInteractor('.pass-field')
  .assert.matches('password')
```
