---
title: Count
---

`#assert.count(selector, length)`

- **selector** - element selector to count
- **length** - the expected number of found elements

The `count()` assertion mirrors the corresponding [helper
method](/helpers/count) and asserts that a certain number of children elements
can be found within the scope.

``` javascript
// with a scoped selector
await new Interactor('.list')
  .assert.count('li', 3)
```
