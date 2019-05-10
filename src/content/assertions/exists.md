---
title: Exists
---

`#assert.exists([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `exists()` assertion mirrors the corresponding [interactor
property](/properties/exists) and asserts that an element exists in the DOM. If
the corresponding property has been redefined, a new assertion is defined which
does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.exists('h1')

// without a scoped selector
await new Interactor('.notification')
  .assert.exists()

// when the corresponding property is overridden
@interactor class NotificationsInteractor {
  exists = exists('.notification')
}

// the scoped selector argument is no longer available
await new NotificationsInteractor('.notifications-tray')
  .assert.exists()
```
