---
title: Disabled
---

The `disabled` property returns the value of the native `element.disabled`
property.

``` javascript
// <input id="foo"/>
new Interactor('#foo').disabled //=> false

// <input id="bar" disabled/>
new Interactor('#bar').disabled //=> true
```

The property creator can be used with custom interactors to reflect the value of
a nested element, and to make assertions against.

``` javascript
import interactor, { disabled } from 'interactor.js';

@interactor class FieldInteractor {
  disabled = disabled('input');
}

// <fieldset id="field">
//   <input disabled/>
// </fieldset>

new FieldInteractor('#field').disabled //=> true

await new FieldInteractor('#field')
  .assert.disabled()
```
