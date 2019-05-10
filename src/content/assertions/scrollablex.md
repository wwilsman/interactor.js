---
title: ScrollableX
---

`#assert.scrollableX([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `scrollableX()` assertion mirrors the corresponding [interactor
property](/properties/scrollablex) and asserts that an element is scrollable in
the horizontal direction. If the corresponding property has been redefined, a
new assertion is defined which does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.scrollableX('.content')

// without a scoped selector
await new Interactor('.has-overflow-x')
  .assert.scrollableX()

// when the corresponding property is overridden
@interactor class PageInteractor {
  scrollableX = scrollableX('.content')
}

// the scoped selector argument is no longer available
await new PageInteractor('.data-page')
  .assert.scrollableX()
```
