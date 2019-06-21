---
title: Using Actions
---

## Interactor creators

Interactor.js provides interactor creators that simplify making quick
interactions without needing to create a new interactor each time. Since these
actions return scoped interactors, other actions can then be chained from them
as well.

``` javascript
import { focus, click } from 'interactor.js';

await focus('.email').type('email@domain.tld').blur();
await focus('.password').type('CorrectHorseBatteryStaple').blur();
await click('.submit').timeout(500);
```

Built-in actions that ship with interactor.js can be found [here](/actions).

<!-- hint: danger -->
Actions return interactors, and each interactor has it's own timeout. Always
prefer creating interactions by chaining actions together rather than awaiting
on multiple interactors. This way the entire interaction remains quick and
succinct.
<!-- endhint -->

## Custom actions

Creating custom actions is as easy as returning interactors from your own
functions. A [`scoped()`](/helpers/scoped) helper is even provided if you
prefer not to use the new keyword inside of custom actions.

``` javascript
import { scoped } from 'interactor.js';

function fill(selector, value) {
  return scoped(selector)
    .focus()
    .type(value)
    .blur();
}

await fill('.full-name', 'Name Namerson');
```

## Interacting with the DOM

When the default actions don't work for your particular use-case and you need to
interact with the DOM node directly, you can use the `do()` method of
interactors and provide a custom callback to add to the interaction
queue. Callbacks provided to `do()` are only run once, and if an error occurs it
will be immediately thrown.

``` javascript
import { scoped } from 'interactor.js';

function checkValidity(selector) {
  return scoped(selector)
    .do(element => {
      // might trigger an 'invalid' event
      element.checkValidity();
    });
}
```

<!-- hint: info -->
Interactors also have an `$element` getter that will lazily return the DOM node
or throw an error if the node does not exist.
<!-- endhint -->

## Asynchronous actions

When creating custom actions, you sometimes need to wait for specific DOM state
to be met before interacting with the DOM node. This can be achieved with
assertions via the `assert()` method. These assertions will be run repeatedly
until they pass or until the interactor timeout has been exceeded. An assertion
is considered to be passing when it does not throw an error or return false.

``` javascript
scoped('input')
  .assert(element => {
    if (!element.required && !element.pattern) {
      throw new Error('no pattern to check validity');
    }
  })
  .do(element => {
    element.checkValidity();
  });
```

<!-- hint: danger -->
Since assertions can be run repeatedly, they should be pure and free of
side-effects. If given an async function, or a function that returns a promise,
an error will be thrown.
<!-- endhint -->
