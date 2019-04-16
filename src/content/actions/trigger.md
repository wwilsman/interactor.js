---
title: Trigger
---

## Method

`#trigger([selector], event[, options])`

- **selector** - optional selector to trigger the event on a nested element
- **event** - the name of the event to trigger
- **options** - optional event properties assigned to the event

The `interactor.trigger()` method will trigger any event with the specified
properties on the interactor's element when the interactor is run. When given a
`selector`, it will trigger the event on a nested element instead. It returns a
new instance of the interactor with the action added to it's queue.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.foo').trigger('barevent', { baz: true });
await new Interactor().trigger('.foo', 'barevent', { baz: true });
```

## Action

`trigger(selector, event[, options]) => Interactor`

- **selector** - element selector to trigger the event on
- **event** - the name of the event to trigger
- **options** - optional event properties assigned to the event

The `trigger()` action returns an interactor which will trigger any event on the
specified element. The returned interactor can be run by itself, or used when
composing a custom interactor.

``` javascript
import interactor, { trigger } from 'interactor.js';

await trigger('.foo', 'barevent');

@interactor class FooInteractor {
  triggerBar = opts => trigger('barevent', opts);
}

await new FooInteractor('.foo').triggerBar({ baz: true });
```
