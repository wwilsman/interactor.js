---
title: Matches
---

## Method

`#matches([selector], match)`

- **selector** - optional selector to match a nested element
- **match** - the selector string to match

The `matches()` method returns true or false when an element matches the
specified `match` selector. If the element does not exist, an error will be
thrown.

``` javascript
let email = new Interactor('.email-field');

// returns true when matching
email.matches('.is-required') === true

// returns false when not matching
email.matches('input', '.name') === false

// throws an error for non-existent elements
email.matches('.foobar', '[data-foo]') //=> Error: unable to find ".foobar"
```

## Property Creator

`matches([selector], match)`

- **selector** - optional selector to match a nested element
- **match** - the selector string to match

The `matches()` property creator can be used with custom interactors to create a
lazy getter property that returns true or false if the element matches the
selector or not. When no selector is provided, it matches on the interactor's
element.

``` javascript
import interactor, { matches } from 'interactor.js';

@interactor class FieldInteractor {
  hasErrors = matches('.has-errors')
  isEmail = matches('input', '.email')
}

new FieldInteractor('.email-field').hasErrors //=> true
new FieldInteractor('.pass-field').isEmail //=> false
```
