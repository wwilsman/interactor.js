---
title: Uncheck
---

## Method

`#uncheck([selector])`

- **selector** - optional selector to uncheck a nested element

The `interactor.check()` method will set the `checked` property to `false` and
trigger input and change events on the interactor's element when the interactor
is run. When given a `selector`, it will trigger the events on a nested element
instead. It returns a new instance of the interactor with the action added to
it's queue.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.checkbox')
  .check()
  .uncheck();

await new Interactor('.check-group')
  .check('.checkbox')
  .uncheck('.checkbox');
```

<!-- hint: warning -->
The `uncheck()` method will first assert that the element is a checkbox or radio
element and is not disabled.
<!-- endhint -->

## Action

`uncheck(selector)`

- **selector** - element selector to uncheck

The `uncheck()` action returns an interactor which will set the `checked`
property to `false` and trigger input and change events on the specified
element. The returned interactor can be run by itself, or used when composing a
custom interactor.

``` javascript
import interactor, { check, uncheck } from 'interactor.js';

await check('.checkbox');
await uncheck('.checkbox');

@interactor class CheckGroupInteractor {
  checkBox = value => check(`.checkbox[value="${value}"]`);
  uncheckBox = value => uncheck(`.checkbox[value="${value}"]`);
}

await new RadioGroupInteractor('.check-group')
  .checkBox('red')
  .uncheckBox('red');
```

<!-- hint: warning -->
The `uncheck()` action will first assert that the element is a checkbox or radio
element and is not disabled.
<!-- endhint -->
