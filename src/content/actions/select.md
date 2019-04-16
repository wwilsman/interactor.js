---
title: Select
---

## Method

`#select([selector], option)`

- **selector** - optional selector to scope to a nested select element
- **option** - the option's text to select within the select element

The `interactor.select()` method will select an option and trigger input and
change events on the interactor's select element when the interactor is
run. When given a `selector`, it will trigger the events and select options in a
nested select element instead. It returns a new instance of the interactor with
the action added to it's queue.

When the select element is a multi-select (`multiple="true"`), the option is
toggled instead of selected, and multiple options can be specified by providing
an array of options' text as the `option` argument.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.country-select').select('United States');
await new Interactor().select('.colors-multi', ['Red', 'Yellow', 'Blue']);
```

<!-- hint: warning -->
The `select()` method will first check that the element is actually a select
element, if it has `multiple="true"` when providing multiple options, and if the
specified option(s) exists and are not disabled.
<!-- endhint -->

## Action

`select(selector, option)`

- **selector** - optional selector to scope to a nested select element
- **option** - the option's text to select within the select element

The `select()` action returns an interactor which will select an option and
trigger input and change events on the specified element. The returned
interactor can be run by itself, or used when composing a custom interactor.

When the select element is a multi-select (`multiple="true"`), the option is
toggled instead of selected, and multiple options can be specified by providing
an array of options' text as the `option` argument.

``` javascript
import interactor, { select } from 'interactor.js';

await select('.countries', 'United Kingdom');

@interactor class FormInteractor {
  selectColor = (...colors) => select('.colors-multi', colors);
}

await new FormInteractor('.form').selectColor('Red', 'Blue');
```

<!-- hint: warning -->
The `select()` action will first check that the element is actually a select
element, if it has `multiple="true"` when providing multiple options, and if the
specified option(s) exists and are not disabled.
<!-- endhint -->
