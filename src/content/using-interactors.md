---
title: Using Interactors
---

## Lazy and immutable

Interactors are lazy and immutable, meaning you can create interactions based on
other interactions and they will not actually do anything until they are run.

``` javascript
import { Interactor } from 'interactor.js';

let loginForm = new Interactor('.login-form');
let typeEmail = loginForm.type('.email', 'email@domain.tld');
let typePassword = loginForm.type('.password', 'CorrectHorseBatteryStaple');
let fillAndLogin = typeEmail.append(typePassword).click('.submit');

typeEmail.run()
  .then(() => console.log('email entered'))
  .catch(() => console.error('error filling email'));

fillAndLogin.run()
  .then(() => console.log('logged in'))
  .catch(() => console.error('error logging in'));
```

An error will be thrown when the element does not exist or when an internal
validation fails. For example, you cannot type into a field when it is disabled,
so an error will be thrown when attempting to type into a disabled input field.

## Asynchronous behavior

When an error occurs within an interaction, that step of the interaction will be
rerun until it passes, or a timeout is reached. This gives any asynchronous
logic time to render any elements that have yet to be rendered or updated. The
error timeout can be controlled with the `timeout()` method.

<!-- hint: info -->
Interactors are themselves thennable and can be awaited on directly using await
without the need to call `run()`.
<!-- endhint -->

``` javascript
await new Interactor('.signup-form')
  // gives this entire interaction 5 seconds to take place
  .timeout(5000)
  // waits for each element to exist and not be disabled
  .type('.first-name', 'Name')
  .type('.last-name', 'Namerson')
  .type('.email', 'email@domain.tld')
  .check('.terms-checkbox')
  .click('.submit')
```

Other actions have their own built-in validations, such as `focus()` ensuring
that the element is focusable, and `blur()` ensuring that the element first has
focus. To see which validations occur for an action, check out each actions
corresponding [API section](/actions).

## Reading DOM state

In addition to interacting with DOM elements, interactors have the ability to
read DOM state as well. This is useful for making assertions within tests after
actions have been performed. Interactor properties are also lazy and values are
computed only when accessed.

``` javascript
let email = new Interactor('.email');

it('shows an error for invalid email addresses', async () => {
  expect(email.value).toBe('');

  await email.focus().type('email.address').blur();

  expect(email.value).toBe('email.address');
  expect(email.matches('.has-error')).toBe(true);

  await email.focus().type('@domain.tld').blur();

  expect(email.value).toBe('email.address@domain.tld');
  expect(email.matches('.has-error')).toBe(false);
});
```

Built-in properties can be found here and custom properties can be created using
the computed helper.
