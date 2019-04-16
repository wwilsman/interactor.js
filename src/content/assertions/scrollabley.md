---
title: ScrollableY
---

`#assert.scrollableY([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `scrollableY()` assertion mirrors the corresponding [interactor
property](/properties/scrollabley) and asserts that an element is scrollable in
the vertical direction. If the optional selector is omitted, and the
corresponding property has been redefined, the new property will be used to
assert against. When a selector is provided, a new scoped interactor is created
to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.scrollableY('.content')

// without a scoped selector
await new Interactor('.has-overflow-x')
  .assert.scrollableY()

// when the corrisponding property is overridden
@interactor class PageInteractor {
  scrollableY = scrollableY('.content')
}

// if given a selector, the default behavior would be used
await new PageInteractor('.about-page')
  .assert.scrollableY()
```
