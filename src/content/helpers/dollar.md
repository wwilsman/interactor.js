---
title: $
---

## Method

`#$([selector])`

- **selector** - optional selector

The `$()` method returns a DOM node matching the provided selector scoped to the
current interactor. If no selector is provided, the interactor's own DOM node is
returned. If the element does not exist in the DOM, an error will be thrown.

``` javascript
let loginForm = new Interactor('.login-form');

// returns the login form element
loginForm.$() === loginForm.$element

// returns a scoped element within the login form
loginForm.$('.name').tagName === 'INPUT';

// throws an error when the element does not exist
loginForm.$('.foobar') //=> Error: unable to find ".foobar"
```
