---
title: Blur
---

## Method

`#blur([selector])`

- **selector** - optional selector to blur a nested element

The `interactor.blur()` method will trigger a blur event on the interactor's
element when the interactor is run. When given a `selector`, it will trigger a
blur event on a nested element instead. It returns a new instance of the
interactor with the action added to it's queue.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.input')
  .focus()
  .blur();

await new Interactor('.form')
  .focus('.input')
  .blur('.input');
```

<!-- hint: warning -->
The `focus()` method will first assert that the element currently has focus.
<!-- endhint -->

## Action

`blur(selector) => Interactor`

- **selector** - element selector to blur

The `blur()` action returns an interactor which will trigger a blur event on the
specified element. The returned interactor can be run by itself, or used when
composing a custom interactor.

``` javascript
import interactor, { focus, blur } from 'interactor.js';

await focus('.input');
await blur('.input');

@interactor class FormInteractor {
  focusEmail = focus('.email-input');
  blurEmail = blur('.email-input');
  focusOther = name => focus(`input[name="${name}"]`);
  blurOther = name => blur(`input[name="${name}"]`);
}

await new FormInteractor('.form')
  .focusEmail()
  .blurEmail();

await new FormInteractor('.form')
  .focusOther('password')
  .blurOther('password');
```

<!-- hint: warning -->
The `blur()` action will first assert that the element currently has focus.
<!-- endhint -->
