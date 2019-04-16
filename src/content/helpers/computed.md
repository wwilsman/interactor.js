---
title: Computed
---

## Property Creator

`computed([selector], getterFn)`

- **selector** - optional selector to scope the computed property to a nested element
- **getterFn** - a function that is invoked when the property is accessed

The `computed()` helper can be used to create reusable computed property
getters. In addition to making computed properties reusable, the `getterFn` is
passed the element node of the scoped element, or the interactor's own element
when no selector is provided. If the `getterFn` function requires the element
argument, an error will be thrown before the function is called if the element
cannot be found. If no element argument is specified, this check is not
performed.

``` javascript
import interactor, { computed } from 'interactor.js';

// custom property creator
function noValidate(selector) {
  return computed(selector, element => element.noValidate)
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
