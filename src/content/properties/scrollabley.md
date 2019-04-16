---
title: ScrollableY
---

The `scrollableY` property returns a boolean value indicating that an element
can be scrolled in the y direction, that is when the `scrollHeight` is greater
than the element's own `clientHeight`.

``` javascript
// <div class="container" style="height: 100px;">
//   <div class="content" style="height: 1000px;"></div>
// </div>

new Interactor('.container').scrollableY //=> true
new Interactor('.content').scrollableY // => false
```

The property creator can be used with custom interactors to reflect whether a
nested element is scrollable or not.

``` javascript
import interactor, { scrollableY } from 'interactor.js';

@interactor class PageInteractor {
  scrollableY = scrollableY('.container')
}

new PageInteractor('.home').scrollableY //=> true/false
```
