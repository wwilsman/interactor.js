<p align="center">
  <a href="https://interactorjs.io">
    <img alt="interactor.js" width="600px" src="https://raw.githubusercontent.com/wwilsman/interactor.js/master/www/src/images/logo.svg?sanitize=true"/>
  </a>
</p>

<p align="center">
  Fast, intuitive, asynchronous interactions for anything that runs in a browser.
</p>

<p align="center">
  <a href="https://github.com/wwilsman/interactor.js/actions/workflows/test.yml">
    <img src="https://github.com/wwilsman/interactor.js/actions/workflows/test.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/wwilsman/interactor.js">
    <img src="https://codecov.io/gh/wwilsman/interactor.js/branch/master/graph/badge.svg" />
  </a>
</p>

## What is interactor.js?

Interactor.js works with anything that runs in a browser, and can run alongside your tests to
produce blazingly fast results. Interactions automatically wait for elements to exist or other
assertions to pass before running, and assertions are run again after they succeed to add a layer of
reliability. Interactions and assertions can also be chained together and reused to create complex
user interactions.

## Quick start

An interactor instance is provided out-of-the-box so you can immediately start creating
interactions. In the example below, interactions are used with a TodoMVC application to create and
mark a todo item as completed.

``` javascript
import { I } from 'interactor.js';

// find elements by their contents like users would
await I.find('What needs to be done?')
  .then.type('Write documentation')
  .then.press('Enter')
  // chain multiple interactions together
  .then.type('Release update')
  .then.press('Enter');

// a query selector can be used instead of text content
await I.find('$(.todo-list li)').times(2)
  .then.assert.text('Write documentation')
  // chained .find() continues searching from the previous element
  .then.find('$(li)').text('Release update');

// test attributes can also be referenced with a similar syntax
await I.click('::(todo-item-toggle)') // == $([data-test="todo-item-toggle"])
  .then.find('Write documentation').matches('.completed');
```

## License

[MIT](https://github.com/wwilsman/interactor.js/blob/master/LICENSE)
