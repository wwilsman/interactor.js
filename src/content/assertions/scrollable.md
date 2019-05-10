---
title: Scrollable
---

`#assert.scrollable([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `scrollable()` assertion mirrors the corresponding [interactor
property](/properties/scrollable) and asserts that an element is scrollable in
either the horizontal or vertical direction. If the corresponding property has
been redefined, a new assertion is defined which does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.scrollable('.content')

// without a scoped selector
await new Interactor('.has-overflow')
  .assert.scrollable()

// when the corresponding property is overridden
@interactor class PageInteractor {
  scrollable = scrollable('.content')
}

// the scoped selector argument is no longer available
await new PageInteractor('.home-page')
  .assert.scrollable()
```
