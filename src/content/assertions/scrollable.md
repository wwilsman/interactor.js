---
title: Scrollable
---

`#assert.scrollable([selector])`

- **selector** - optional selector to scope the assertion to a nested element

The `scrollable()` assertion mirrors the corresponding [interactor
property](/properties/scrollable) and asserts that an element is scrollable in
either the horizontal or vertical direction. If the optional selector is
omitted, and the corresponding property has been redefined, the new property
will be used to assert against. When a selector is provided, a new scoped
interactor is created to perform the assertion.

``` javascript
// with a scoped selector
await new Interactor('.page')
  .assert.scrollable('.content')

// without a scoped selector
await new Interactor('.has-overflow')
  .assert.scrollable()

// when the corrisponding property is overridden
@interactor class PageInteractor {
  scrollable = scrollable('.content')
}

// if given a selector, the default behavior would be used
await new PageInteractor('.home-page')
  .assert.scrollable()
```
