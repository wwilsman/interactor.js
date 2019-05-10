---
title: Count
---

## Method

`#count(selector)`

- **selector** - element selector to count

The `count()` method returns the number of children elements found using the
specified selector.

``` javascript
// <ul><li></li><li></li><li></li></ul>
let list = new Interactor('.list');

// returns the number of elements found
list.count('li') === 3
```

## Property Creator

`count(selector)`

- **selector** - element selector to count

The `count()` property creator can be used with custom interactors to create a
lazy getter property that returns the number of elements found using the
provided selector. It also automatically defines a matching assert method.

``` javascript
import interactor, { count } from 'interactor.js';

@interactor class ListInteractor {
  length = count('li');
}

new ListInteractor('.list').length //=> 3

await new ListInteractor('.list')
  .assert.length(3)
```
