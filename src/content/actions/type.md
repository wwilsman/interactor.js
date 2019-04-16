---
title: Type
---

## Method

`#type([selector], string[, options])`

- **selector** - optional selector to type in a nested element
- **string** - the string to type into the element which may contain special
  modifiers
- **options** - options to control how to type into the element
  - **change** - triggers a change event when true (default false)
  - **delay** - milliseconds between triggering events (default 0)
  - **range** - where to insert characters into the element (defaults to the
    end of the input)

The `interactor.type()` method will trigger keydown, keypress, beforeinput,
input, and keyup events (in that order) for each character in `string` on the
interactor's element when the interactor is run. The value of the input will be
modified between the beforeinput and input events if prior events were not
cancelled. Focus and blur events are not triggered with this method. When given
a `selector`, it will trigger events and modify the value of a nested element
instead. It returns a new instance of the interactor with the action added to
it's queue.

The `change` option will trigger a change event once at the end of the
interaction. The `delay` option will introduce a delay between characters and
triggering their respective events. The `range` option can be provided to insert
characters at an index, or remove/replace characters between indices.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.input')
  .type('world')
  .type('hello ', { range: 0 })
  .type('H', { range: [0, 1] });

// input.value === "Hello world"

await new Interactor('.form')
  .type('.email', 'email@domain.tld', { delay: 100 });

await new Interactor('.password')
  .type('CorrectHorseBatteryStaple', { change: true });
```

<!-- hint: warning -->
The `type()` method will first assert that the element is an input, textarea, or
content editable element and is not disabled.
<!-- endhint -->

## Action

`type(selector, string[, options]) => Interactor`

- **selector** - element selector to type into
- **string** - the string to type into the element which may contain special
  modifiers
- **options** - options to control how to type into the element (see above)

The `type()` action returns an interactor which will trigger keydown, keypress,
beforeinput, input, and keyup events (in that order) for each character in
`string` on on the specified element. The value of the input will be modified
between the beforeinput and input events if prior events were not
cancelled. Focus and blur events are not triggered with this action. The
returned interactor can be run by itself, or used when composing a custom
interactor.

See the interactor [method above](#method) for details on the various options.

``` javascript
import interactor, { type } from 'interactor.js';

await type('.input', 'foobar');

@interactor class EditorInteractor {
  type = string => type('[contenteditable]', string, { change: true });
}

await new EditorInteractor('.editor').type('Hello World!');
```

<!-- hint: warning -->
The `type()` action will first assert that the element is an input, textarea, or
content editable element and is not disabled.
<!-- endhint -->
