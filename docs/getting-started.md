---
title: Getting Started
---

Install interactor.js using `yarn`:

``` bash
$ yarn add --dev interactor.js
```

Or `npm`:

``` bash
$ npm install --save-dev interactor.js
```

## Interactor Actions and Properties

Interactors will work anywhere they have access to the DOM. Actions and properties can be awaited on
to execute an action on an element or to return an element's property value. For example, we can
type into an input with the [`type`](/actions/type) action, check for a matching class with the
[`matches`](/properties/matches) property, or click on a button with the [`click`](/actions/click)
action.

``` javascript
import { type, matches, click } from 'interactor.js';

// all actions wait for the element to exist
await type('.email', 'email@domain.tld');

// properties can be used in tests or automations
let isValid = await matches('.email', '.is-valid');

// some actions also wait for other criteria, such as for the element to not be disabled
await type('.password', 'hunter2');
await click('.submit');
```

Many other [actions](/actions) and [properties](/properties) are also included with
interactor.js. Custom actions can be created by returning interactors from custom functions.

## Chaining and Nesting Interactors

In addition to a few core methods, all actions and properties are also available as interactor
methods and properties. One of the core methods, [`find`](/api/find), can be used to nest actions
scoped to specific elements.

``` javascript
import Interactor from 'interactor.js';

// create a login action
function login(email, password) {
  return Interactor('.login')
    .find('.email').type(email)
    .find('.password').type(password)
    .find('.submit').click()
}

await login('email@domain.tld', 'hunter2');
```

Another core method, [`exec`](/api/exec), can also be used to nest actions scoped to specific
elements by composing other interactor instances. A callback may be provided instead, which will be
executed with the current element when the interactor is awaited on.

``` javascript
import Interactor, { type, click } from 'interactor.js';

// create a logging action
function log(selector) {
  return Interactor(selector)
    .exec($element => console.log($element));
}

// used as is
await log('.some-element');

// or compose with exec
await Interactor('.login')
  .find('.email').type('email@domain.tld')
  .exec(log('.email'))
```

## Creating Interactors

Custom interactors can be defined for specific components using [`extend`](/api/extend). These
interactors can then become the building blocks of tests and automations.

``` javascript
import Interactor, { focus } from 'interactor.js';

const Login = Interactor.extend({
  email: Interactor('.email'),
  password: Interactor('.password'),
  submit: Interactor('.submit')
});

await Login()
  .email.type('email@domain.tld')
  .password.type('hunter2')
  .submit.click();
```

To learn more about creating and composing interactors, see the documentation for [Creating
Interactors](/creating-interactors).
