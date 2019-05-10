---
title: ScrollableX
---

The `scrollableX` property returns a boolean value indicating that an element
can be scrolled in the x direction, that is when the `scrollWidth` is greater
than the element's own `clientWidth`.

``` javascript
// <div class="container" style="width: 100px;">
// <div class="content" style="width: 1000px;"></div> // </div>

new Interactor('.container').scrollableX //=> true
new Interactor('.content').scrollableX // => false
```

The property creator can be used with custom interactors to reflect whether a
nested element is scrollable or not, and to make assertions against.

``` javascript
import interactor, { scrollableX } from 'interactor.js';

@interactor class PageInteractor {
  scrollableX = scrollableX('.container')
}

new PageInteractor('.home').scrollableX //=> true/false

await new PageInteractor('.home')
  .assert.scrollableX()
```
