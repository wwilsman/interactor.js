---
title: Text
---

The `text` property returns the `innerText` content of an element. The
`innerText` property will reflect CSS styles that alter the text's appearance
(and cause a reflow).

``` javascript
// <p style="font-style: uppercase;">
//   hello world!
// </p>

new Interactor('p').text //=> "HELLO WORLD!"
```

The property creator can be used with custom interactors to retrieve a nested
element's text.

``` javascript
import interactor, { text } from 'interactor.js';

@interactor class FieldInteractor {
  label = text('label')
}

new FieldInteractor('.email').label //=> "Email Address:"
```
