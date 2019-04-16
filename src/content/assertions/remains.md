---
title: Remains
---

`#assert.remains([timeout])`

- **timeout** - amount of time in milliseconds to continue running the previous
  assertions (defaults to 1/10th the total interactor timeout or 20ms, whichever
  is greater).

The `remains()` method will group any previous assertions to run at the same
time and continue to run those assertions once every 10ms for the specified
duration. It might be useful to call this method when you need to ensure that an
assertion is continuous for an amount of time.

``` javascript
await new Interactor('.page')
  .assert.exists('.modal')
  .assert.matches('.modal', '.attention')
// ensures the above assertions are true for at least 1 second
  .assert.remains(1000)
```
