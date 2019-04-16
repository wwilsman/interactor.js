---
title: $$
---

## Method

`#$$(selector)`

- **selector** - selector string

The `$$()` method returns an array of DOM nodes matching the provided selector
scoped to the current interactor. Unlike the `$()` method, an error will not be
thrown if the elements do not exist, instead it will return an empty array. The
array returned by this method is _not_ a live list of elements, it is an array
of elements that existed at the time the method was called.

``` javascript
let group = new Interactor('.checkbox-group');

group.$$('input').forEach(checkbox => {
  console.log(checkbox.name, checkbox.value);
});
```
