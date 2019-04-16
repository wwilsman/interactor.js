---
title: Value
---

The `value` property returns the value of the native `element.value` property of
inputs.

``` javascript
// <input value="ayyoo"/>

new Interactor('input').value //=> "ayyoo"
```

The property creator can be used with custom interactors to retrieve a nested
input's value.

``` javascript
import interactor, { value } from 'interactor.js';

@interactor class FieldInteractor {
  value = value('input')
}

new FieldInteractor('.email').value //=> "email@domain.tld"
```
