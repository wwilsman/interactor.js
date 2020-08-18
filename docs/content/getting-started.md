---
title: Getting Started
---

## What is interactor.js?

Interactors will work anywhere they can access the DOM. They can automatically wait for elements to
exist before interacting with them, buttons to not be disabled before clicking, inputs to be
focusable before typing, etc.

## Installing

Install interactor.js using `yarn`:

``` session
$ yarn add --dev interactor.js
```

Or `npm`:

``` session
$ npm install --save-dev interactor.js
```

## Using Interactors

Interactors will execute any queued actions when awaited on. Some basic actions can be created with
[interactor action creators](/actions).

``` javascript
import { focus, type, blur, click } from 'interactor.js';

await focus('.email');
await type('.email', 'email@domain.tld');
await blur('.email');

await focus('.password');
await type('.password', 'hunter2');
await blur('.password');

await click('.submit');
```

## Interactor Actions

All actions return interactors, and all actions are also available as interactor methods. The above
can be simplified into a few distinct resuable actions.

``` javascript
import { focus, click } from 'interactor.js';

const fillEmail = val => focus('.email').type(val).blur();
const fillPassword = val => focus('.password').type(val).blur();
const clickSubmit = () => click('.submit');

async function login(email, password) {
  await fillEmail(email);
  await fillPassword(password);
  await clickSubmit();
}

await login('email@domain.tld', 'hunter2');
```

## Composing Interactors

Interactors can also be composed with other interactors, which will be scoped to the parent
interactor. Using the interactor methods [`exec`](/api/exec) and [`find`](/api/find), we can keep
simplifying the above example even further.

``` javascript
import Interactor, { focus } from 'interactor.js';

const fill = (sel, val) => focus(sel).type(val).blur();
const login = (email, password) => Interactor('.login')
  .exec(fill('.email', email))
  .exec(fill('.password', password))
  .find('.submit').click()

await login('email@domain.tld', 'hunter2');
```

## Custom Interactors

Rather than defining reusable actions, custom interactors can be defined for specific components
using [`extend`](/api/extend). These interactors can then become the building blocks of tests and
automations.

``` javascript
import Interactor, { focus } from 'interactor.js';

const Input = Interactor.extend({
  fill: val => focus().type(val).blur()
});

const Login = Interactor.extend({
  email: Input('.email'),
  password: Input('.password'),
  submit: Interactor('.submit')
});

await Login()
  .email.fill('email@domain.tld')
  .password.fill('hunter2')
  .submit.click();
```

To learn more about creating and composing interactors, see the documentation for [Creating
Interactors](/creating-interactors).
