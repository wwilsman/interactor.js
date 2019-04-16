---
title: Exists
---

The `exists` property returns a boolean value reflecting whether the element
exists or not.

``` javascript
// <div id="foo"></div>
new Interactor('#foo').exists //=> true
new Interactor('#bar').exists //=> false
```

The property creator can be used with custom interactors to reflect the
existance of a nested element.

``` javascript
import interactor, { exists } from 'interactor.js';

@interactor class CardInteractor {
  hasCTA = exists('.call-to-action');
}

new CardInteractor('.info-card').hasCTA //=> false
new CardInteractor('.action-card').hasCTA //=> true
```
