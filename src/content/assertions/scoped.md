---
title: Scoped
---

`#assert.scoped(selector[, properties])`

- **selector** - selector string to select a nested element
- **properties** - optional interactor class or pojo of properties to give the
  resulting interactor

The `scoped()` assert method returns the assertions of a nested interactor
scoped to an element found within the parent interactor's element. Resulting
scoped assertions will return an instance of the the top-most parent interactor.

``` javascript
await new Interactor('.login-form')
  .assert.scoped('.email').value('email@domain.tld')
  .assert.scoped('.submit').not.disabled()
```
