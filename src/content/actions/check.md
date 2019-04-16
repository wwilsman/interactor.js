---
title: Check
---

## Method

`#check([selector])`

- **selector** - optional selector to check a nested element

The `interactor.check()` method will set the `checked` property to `true` and
trigger input and change events on the interactor's element when the interactor
is run. When given a `selector`, it will trigger the events on a nested element
instead. It returns a new instance of the interactor with the action added to
it's queue.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.checkbox').check();
await new Interactor('.check-group').check('.checkbox');
```

<!-- hint: warning -->
The `check()` method will first assert that the element is a checkbox or radio
element and is not disabled.
<!-- endhint -->

## Action

`check(selector)`

- **selector** - element selector to check

The `check()` action returns an interactor which will set the `checked` property
to `true` and trigger input and change events on the specified element. The
returned interactor can be run by itself, or used when composing a custom
interactor.

``` javascript
import interactor, { check } from 'interactor.js';

await check('.radio');

@interactor class RadioGroupInteractor {
  checkBox = value => check(`.checkbox[value="${value}"]`);
}

await new RadioGroupInteractor('.radio-group').checkBox('red');
```

<!-- hint: warning -->
The `check()` action will first assert that the element is a checkbox or radio
element and is not disabled.
<!-- endhint -->
