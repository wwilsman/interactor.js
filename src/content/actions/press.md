---
title: Press
---

## Method

`#press([selector], key[, options])`

- **selector** - optional selector to trigger in a nested element
- **key** - name of the key to press, such as `KeyA`
- **options** - options to control how to trigger the event
  - **delay** - amount of time in milliseconds between events (default 0)
  - **range** - where to insert characters into the element (defaults to the
    end of the input)

The `interactor.press()` method will trigger keydown and keyup events for the
specified key on the interactor's element when the interactor is run. If the key
produces a character, keypress and input events will also be triggered. When
given a `selector`, it will trigger events on a nested element instead. It
returns a new instance of the interactor with the action added to it's queue.

The `delay` option will delay the keyup event for an amount of time after the
keydown event (in milliseconds). The `range` option can be provided to insert
characters at an index, or remove/replace characters between indices.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.input')
  .keydown('Shift')
  .press('KeyH')
  .keyup('Shift')
  .press('KeyE')
  .press('KeyL')
  .press('KeyL')
  .press('KeyO')
  .press('Backspace', { range: [2, 4] })
  .press('KeyY', { range: 2 })

// input.value === "Heyo"
```

## Action

`press(selector, key[, options]) => Interactor`

- **selector** - element selector to trigger the events on
- **key** - name of the key to press, such as `KeyA`
- **options** - options to control how to trigger the event (see above)

The `press()` action returns an interactor which will trigger keydown and keyup
events for the specified key on the specified element. If the key produces a
character, keypress and input events will also be triggered. The returned
interactor can be run by itself, or used when composing a custom interactor.

See the interactor [method above](#method) for details on the various options.

``` javascript
import interactor, { press } from 'interactor.js';

await press('.target', 'PageUp', { delay: 100 });

@interactor class FieldInteractor {
  // ...
  clear = () => press('.input', 'Delete', { range: [0, 1000] });
}

await new FieldInteractor('.name-field')
  .type('Name Namerson')
  .clear();
```
