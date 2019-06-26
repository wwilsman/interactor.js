---
title: Checked
---

The `checked` property returns the value of the native `element.checked`
property.

``` javascript
// <input id="foo" value="foo" type="radio"/>
// <input id="bar" value="bar" type="radio" checked/>
new Interactor('#foo').checked //=> false
new Interactor('#bar').checked //=> true
```

The property creator can be used with custom interactors to reflect the value of
a nested element, and to make assertions against.

``` javascript
import interactor, { checked } from 'interactor.js';

@interactor class AgreementInteractor {
  checked = checked('[type="checkbox"]');
}

// <fieldset id="agreement">
//   <input type="checkbox" checked/>
// </fieldset>

new AgreementInteractor('#agreement').checked //=> true

await new AgreementInteractor('#agreement')
  .assert.checked()
```
