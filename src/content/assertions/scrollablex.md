---
title: ScrollableX
---

`#assert.scrollableX([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `scrollableX()` assertion mirrors the corresponding [interactor
property](/properties/scrollablex) and asserts that an element is scrollable in
the horizontal direction. If the optional selector is omitted, and the
corresponding property has been redefined, the new property will be used to
assert against. When a selector is provided, a new scoped interactor is created
to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.scrollableX('.content')

// without a scoped selector
await new Interactor('.has-overflow-x')
  .assert.scrollableX()

// when the corrisponding property is overridden
@interactor class PageInteractor {
  scrollableX = scrollableX('.content')
}

// if given a selector, the default behavior would be used
await new PageInteractor('.data-page')
  .assert.scrollableX()
```
