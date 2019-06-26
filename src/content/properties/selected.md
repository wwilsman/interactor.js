---
title: Selected
---

The `selected` property returns the value of the native `element.selected`
property.

``` javascript
// <select id="foo"/>
//   <option value="foo" selected>Foo</option>
//   <option value="bar">Bar</option>
// </select>
new Interactor('#foo [value="foo"]').selected //=> true
new Interactor('#foo [value="bar"]').selected //=> false
```

The property creator can be used with custom interactors to reflect the value of
a nested element, and to make assertions against.

``` javascript
import interactor, { selected } from 'interactor.js';

@interactor class SelectInteractor {
  fooSelected = selected('[value="foo"]');
}

// <select id="select"/>
//   <option value="foo" selected>Foo</option>
//   <option value="bar">Bar</option>
// </select>

new SelectInteractor('#select').fooSelected //=> true

await new SelectInteractor('#select')
  .assert.fooSelected()
```
