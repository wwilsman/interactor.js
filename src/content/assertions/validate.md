---
title: Validate
---

`#assert.validate()`

The `validate()` method will group any previous assertions to run at the same
time. This is automatically called whenever an action occurs or when the
interactor is run. It might be useful to call this method yourself when you need
sequential assertions to run independantly of each other.

``` javascript
await new Interactor('.notification-area')
  .assert.exists('.notification')
  .assert.matches('.notification', '.error')
// groups `exists` and `matches` assertions above
  .assert.validate()
// will not be grouped with the above
  .assert.not.exists('.notification')
```
