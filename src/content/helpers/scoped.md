---
title: Scoped
---

## Method

`#scoped(selector[, properties])`

- **selector** - selector string to select a nested element
- **properties** - optional interactor class or pojo of properties to give the
  resulting interactor

The `scoped()` method returns a nested interactor scoped to an element found
within the parent interactor's element. Resulting scoped methods will return an
instance of the the top-most parent interactor.

``` javascript
new Interactor('.login-form')
  .scoped('.email').type('email@domain.tld')
  .scoped('.pass').type('CorrectHorseBatteryStaple')
  .scoped('.remember').check()
```

## Property Creator

`#scoped([selector][, properties])`

- **selector** - optional selector string to select a nested element
- **properties** - optional interactor class or pojo of properties to give the
  resulting interactor

The `scoped()` property creator performs the same functionality as nesting any
interactor instance within a custom interactor. It is provided as a shortcut
around using the new keyword.

``` javascript
import interactor, { scoped } from 'interactor.js';

// can be used for creating custom actions
function fill(selector, string) {
  return scoped(selector)
    .focus()
    .type(string)
    .blur()
}

@interactor class FieldInteractor {
  fill = string => fill('input', string)
  value = value('input')
}

@interactor class SignInInteractor {
  email = scoped('.name-field', FieldInteractor)
  password = scoped('.pass-field', FieldInteractor)
  submit = () => scoped('.submit').click()
}

let signInForm = new SignInInteractor('.signin-form');

await signInForm
  .email.fill('email@domain.tld')
  .password.fill('CorrectHorseBatteryStaple')

signInForm.email.value //=> "email@domain.tld"
signInForm.password.value //=> "CorrectHorseBatteryStaple"

await signInForm.submit()
```
