---
title: Attribute
---

## Method

`#attribute([selector], attr)`

- **selector** - optional selector to retrieve the attribute of a nested element
- **attr** - the attribute name

The `attribute()` method returns the value of the attribute of the specified
element. If the element does not exist, an error will be thrown.

``` javascript
let loginForm = new Interactor('.login-form');

// returns an attribute of the form
loginForm.attribute('method') === 'POST'

// returns an attribute of a nested element
loginForm.attribute('.email', 'name') === 'email'

// throws an error for non-existent elements
loginForm.attribute('.foobar', 'data-foo') //=> Error: unable to find ".foobar"
```

## Property Creator

`attribute([selector], attr)`

- **selector** - optional selector to retrieve the attribute of a nested element
- **attr** - the attribute name

The `attribute()` property creator can be used with custom interactors to create
a lazy getter property that returns the attribute of the specified element. When
no selector is provided, it returns the attribute of the interactor's
element. It also automatically defines a matching assert method.

``` javascript
import interactor, { attribute } from 'interactor.js';

@interactor class FieldInteractor {
  name = attribute('name')
  type = attribute('input', 'type')
}

new FieldInteractor('.pass-field').name //=> "pass"
new FieldInteractor('.pass-field').type //=> "password"

await new FieldInteractor('.pass-field')
  .assert.name('pass')
  .assert.not.type('text')
```
