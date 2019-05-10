---
title: Property
---

## Method

`#property([selector], prop)`

- **selector** - optional selector to retrieve a property of a nested element
- **prop** - the property name

The `property()` method returns the value of the property of the specified
element. If the element does not exist, an error will be thrown.

``` javascript
let loginForm = new Interactor('.login-form');

// returns a property of the form
loginForm.property('noValidate') === false

// returns a property of a nested element
loginForm.property('.submit', 'disabled') === true

// throws an error for non-existent elements
loginForm.property('.foobar', 'dataset') //=> Error: unable to find ".foobar"
```

## Property Creator

`property([selector], prop)`

- **selector** - optional selector to retrieve a property of a nested element
- **prop** - the property name

The `property()` property creator can be used with custom interactors to create
a lazy getter property that returns a property of the specified element. When no
selector is provided, it returns a property of the interactor's element. It also
automatically defines a matching assert method.

``` javascript
import interactor, { property } from 'interactor.js';

@interactor class FormInteractor {
  noValidate = property('noValidate')
  disabled = property('.submit', 'disabled')
}

new FormInteractor('.login-form').noValidate //=> false
new FormInteractor('.login-form').disabled //=> true

await new FormInteractor('.login-form')
  .assert.not.noValidate()
  .assert.disabled()
```
