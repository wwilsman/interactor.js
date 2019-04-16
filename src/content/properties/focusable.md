---
title: Focusable
---

The `focusable` property returns a boolean value indicating whether the element
is able to be focused, which is an element with a non-negative tabindex.

``` javascript
// <input class="name"/>
new Interactor('.name').focusable //=> true

// <div class="content"></div>
new Interactor('.content').focusable //=> false
```

The property creator can be used with custom interactors to reflect whether a
nested element is focusable or not.

``` javascript
import interactor, { focusable } from 'interactor.js';

@interactor class FieldInteractor {
  focusable = focusable('input');
}

new FieldInteractor('.field').focusable //=> true
```
