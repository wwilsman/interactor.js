---
title: Focus
---

## Method

`#focus([selector])`

- **selector** - optional selector to focus a nested element

The `interactor.focus()` method will trigger a focus event on the interactor's
element when the interactor is run. When given a `selector`, it will trigger a
focus event on a nested element instead. It returns a new instance of the
interactor with the action added to it's queue.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.input').focus();
await new Interactor('.form').focus('.input');
```

<!-- hint: warning -->
The `focus()` method will first assert that the element can be focused. It will
also fail if the document itself cannot be focused; such as when the browser
window does not have focus.
<!-- endhint -->

## Action

`focus(selector) => Interactor`

- **selector** - element selector to focus

The `focus()` action returns an interactor which will trigger a focus event on
the specified element. The returned interactor can be run by itself, or used
when composing a custom interactor.

``` javascript
import interactor, { focus } from 'interactor.js';

await focus('.input');

@interactor class FormInteractor {
  focusEmail = focus('.email-input');
  focusOther = name => focus(`input[name="${name}"]`);
}

await new FormInteractor('.form').focusEmail();
await new FormInteractor('.form').focusOther('password');
```

<!-- hint: warning -->
The `focus()` action will first assert that the element can be focused. It will
also fail if the document itself cannot be focused; such as when the browser
window does not have focus.
<!-- endhint -->
