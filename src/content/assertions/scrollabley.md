---
title: ScrollableY
---

`#assert.scrollableY([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `scrollableY()` assertion mirrors the corresponding [interactor
property](/properties/scrollabley) and asserts that an element is scrollable in
the vertical direction. If the corresponding property has been redefined, a new
assertion is defined which does not accept a selector.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.scrollableY('.content')

// without a scoped selector
await new Interactor('.has-overflow-x')
  .assert.scrollableY()

// when the corresponding property is overridden
@interactor class PageInteractor {
  scrollableY = scrollableY('.content')
}

// the scoped selector argument is no longer available
await new PageInteractor('.about-page')
  .assert.scrollableY()
```
