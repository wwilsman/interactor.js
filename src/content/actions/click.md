---
title: Click
---

## Method

`#click([selector])`

- **selector** - optional selector to click a nested element

The `interactor.click()` method will trigger a click event on the interactor's
element when the interactor is run. When given a `selector`, it will trigger a
click event on a nested element instead. It returns a new instance of the
interactor with the action added to it's queue.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.button').click();
await new Interactor('.form').click('.submit');
```

<!-- hint: warning -->
The `click()` method will first assert that the element is not disabled.
<!-- endhint -->

## Action

`click(selector) => Interactor`

- **selector** - element selector to click

The `click()` action returns an interactor which will trigger a click event on
the specified element. The returned interactor can be run by itself, or used
when composing a custom interactor.

``` javascript
import interactor, { click } from 'interactor.js';

await click('.button');

@interactor class FormInteractor {
  submit = click('.submit');
}

await new FormInteractor('.form').submit();
```

<!-- hint: warning -->
The `click()` action will first assert that the element is not disabled.
<!-- endhint -->
