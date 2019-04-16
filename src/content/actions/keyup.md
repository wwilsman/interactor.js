---
title: Keyup
---

## Method

`#keyup([selector], key[, options])`

- **selector** - optional selector to trigger in a nested element
- **key** - name of the key to deactivate, such as `KeyA`

The `interactor.keyup()` method will trigger a keyup event for the specified key
on the interactor's element when the interactor is run. When given a `selector`,
it will trigger events on a nested element instead. It returns a new instance of
the interactor with the action added to it's queue.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.input')
  .keydown('Shift')
  .press('KeyA')
  .keyup('Shift');
  .press('KeyY')
  .press('KeyY')

// input.value === "Ayy"
```

## Action

`keyup(selector, key[, options]) => Interactor`

- **selector** - element selector to trigger the event on
- **key** - name of the key to deactivate, such as `KeyA`

The `keyup()` action returns an interactor which will trigger a keyup event for
the specified key on the specified element. The returned interactor can be run
by itself, or used when composing a custom interactor.

``` javascript
import interactor, { keydown, keyup, press } from 'interactor.js';

await keyup('.target', 'ArrowRight');

@interactor class FieldInteractor {
  press = key => press('.input', key);
  shift = () => keydown('.input', 'Shift');
  unshift = () => keyup('.input', 'Shift');
}

await new FieldInteractor('.field')
  .shift()
  .press('KeyA')
  .press('KeyB')
  .press('KeyC')
  .unshift();

// input.value === "ABC"
```
