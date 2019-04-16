---
title: Collection
---

## Property Creator

`collection(selector[, properties])`

- **selector** - selector string to select nested elements
- **properties** - optional interactor class or pojo of properties to give
  collection interactors

The `collection()` property creator actually returns a function instead of a
computed property. This function can be called with an index to return an
interactor for that specific element found in the list of matching scoped
elements. Called without an index, an array of interactors is returned matching
the found scoped elements. When a single interactor is returned, any nested
actions will return the parent interactor instance. When an array is returned,
each interactor is treated as a top-level interactor.

The `selector` argument may also be a selector _function_. This function will be
called with the argument given to the resulting collection function and is
expected to return a valid selector used to find a single scoped element. When
no argument is given, the returned selector should match multiple elements to be
used in the resulting interactor array.

``` javascript
import interactor, { collection } from 'interactor.js';

@interactor class FieldInteractor {
  // ...
}

@interactor class RadioGroupInteractor {
  items = collection('input[type="radio"]')
}

@interactor class FormInteractor {
  fields = collection(name => `.${name}-field`, FieldInteractor)
  choices = new RadioGroupInteractor('.radio-group')
}

await new FormInteractor()
  .fields('email').type('email@domain.tld')
  .fields('password').type('CorrectHorseBatteryStaple')
  .choices.items(2).check()
  .click('.submit')
```
