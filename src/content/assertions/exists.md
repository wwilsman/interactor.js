---
title: Exists
---

`#assert.exists([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `exists()` assertion mirrors the corresponding [interactor
property](/properties/exists) and asserts that an element exists in the DOM. If
the optional selector is omitted, and the corresponding property has been
redefined, the new property will be used to assert against. When a selector is
provided, a new scoped interactor is created to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.exists('h1')

// without a scoped selector
await new Interactor('.notification')
  .assert.exists()

// when the corrisponding property is overridden
@interactor class NotificationsInteractor {
  exists = exists('.notification')
}

// if given a selector, the default behavior would be used
await new NotificationsInteractor('.notifications-tray')
  .assert.exists()
```
