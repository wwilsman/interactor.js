---
title: Computed
---

## Property Creator

`computed([selector], getterFn[, matcher])`

- **selector** - optional selector to scope the computed property to a nested element
- **getterFn** - a function that is invoked when the property is accessed
- **matcher** - optional matcher for automatically creating assertions for a property

The `computed()` helper can be used to create reusable computed property
getters. In addition to making computed properties reusable, the `getterFn` is
passed the element node of the scoped element, or the interactor's own element
when no selector is provided. If the `getterFn` function requires the element
argument, an error will be thrown before the function is called if the element
cannot be found. If no element argument is specified, this check is not
performed.

If a `matcher` is supplied it is treated exactly like an assertion provided via
the static `assertions` interactor property (see [custom
assertions](/custom-interactors/#advanced-assertions)). However, the first
argument given to the matcher function is the result of the computed property.

``` javascript
import interactor, { computed } from 'interactor.js';

// custom property creator
function noValidate(selector) {
  return computed(
    selector,
    // computed getter function
    element => element.noValidate,
    // computed assertion matcher
    noValidate => ({
      result: noValidate,
      message: () => `noValidate is ${noValidate}`
    })
  );
}

@interactor class FormInteractor {
  // reusable for other custom interactors
  noValidate = noValidate()

  // normal getters are fine
  get target() {
    return this.$().target;
  }

  // shortcut for the element
  action = computed(element => {
    return element.action;
  })
}
```
