---
title: Focused
---

The `focused` property returns a boolean value indicating whether the element
has focus, which would be the document's current `activeElement`.

``` javascript
// only one element can have focus at a time
new Interactor('.name').focused //=> true
new Interactor('.email').focused //=> false
```

The property creator can be used with custom interactors to reflect whether a
nested element is has focus or not.

``` javascript
import interactor, { focused } from 'interactor.js';

@interactor class FieldInteractor {
  focused = focused('input');
}

new FieldInteractor('.field').focused //=> true/false
```
