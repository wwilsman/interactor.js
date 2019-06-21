---
title: Keydown
---

## Method

`#keydown([selector], key[, options])`

- **selector** - optional selector to trigger in a nested element
- **key** - name of the key to activate, such as `KeyA`
- **options** - options to control how to trigger the event
  - **range** - where to insert characters into the element (defaults to the
    end of the input)

The `interactor.keydown()` method will trigger a keydown event for the specified
key on the interactor's element when the interactor is run. If the key produces
a character, keypress and input events will also be triggered. When given a
`selector`, it will trigger events on a nested element instead. It returns a new
instance of the interactor with the action added to it's queue.

After a key is pressed, subsequent calls with the same key will have `repeat`
set to true. If a key is a modifier key such as `Shift`, `Meta`, `Control`, or
`Alt`, subsequent keys will be sent with that modifier. To release the modifier
key, use [`keyup`](/actions/keyup).

The `range` option can be provided to insert characters at an index, or
remove/replace characters between indices.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.input')
  .keydown('Shift')
  .keydown('KeyA')
  .keydown('KeyA')
  .keyup('Shift')
  .keydown('KeyY')
  .keydown('KeyY')
  .keydown('KeyO')
  .keydown('Backspace', { range: [1, 2] })

// input.value === "Ayo"
```

## Action

`keydown(selector, key[, options]) => Interactor`

- **selector** - element selector to trigger the event on
- **key** - name of the key to activate, such as KeyA
- **options** - options to control how to trigger the event (see above)

The `keydown()` action returns an interactor which will trigger a keydown event
for the specified key on the specified element. If the key produces a character,
keypress and input events will also be triggered. The returned interactor can be
run by itself, or used when composing a custom interactor.

See the interactor [method above](#method) for details on the various options.

``` javascript
import interactor, { keydown } from 'interactor.js';

await keydown('.target', 'ArrowLeft');

@interactor class FieldInteractor {
  // ...
  clear = () => keydown('.input', 'Backspace', { range: [0, 1000] });
}

await new FieldInteractor('.name-field')
  .type('Name Namerson')
  .clear();
```
