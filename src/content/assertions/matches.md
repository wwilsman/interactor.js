---
title: Matches
---

`#assert.matches([selector], match)`

- **selector** - optional selector to scope the assertion to a nested element
- **match** - selector string to match against

The `matches()` assertion mirrors the corresponding [helper
method](/helpers/matches) and asserts that an element matches some selector.

``` javascript
// with a scoped selector
await new Interactor('.signup-form')
  .assert.matches('.submit', '.primary')

// without a scoped selector
await new Interactor('.page')
  .assert.matches('.home-page')
```
