---
title: Scrollable
---

The `scrollable` property returns a boolean value indicating that an element can
be scrolled in _either_ the x or y direction. An element is considered scrollable
when the `scrollHeight` or `scrollWidth` is greater than the element's own
`clientHeight` or `clientWidth` respectively.

``` javascript
// <div class="container" style="width: 100px; heigth: 100px;">
//   <div class="content" style="width: 1000px; height: 1000px;"></div>
// </div>

new Interactor('.container').scrollable //=> true
new Interactor('.content').scrollable // => false
```

The property creator can be used with custom interactors to reflect whether a
nested element is scrollable or not.

``` javascript
import interactor, { scrollable } from 'interactor.js';

@interactor class PageInteractor {
  scrollable = scrollable('.container')
}

new PageInteractor('.home').scrollable //=> true/false
```
