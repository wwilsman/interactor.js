<p align="center">
  <a href="https://interactorjs.io">
    <img alt="interactor.js" width="600px" src="https://raw.githubusercontent.com/wwilsman/interactor.js/main/logo.svg?sanitize=true"/>
  </a>
</p>

<p align="center">
  Fast, intuitive, asynchronous interactions for anything that runs in a browser.
</p>

<p align="center">
  <a href="https://github.com/wwilsman/interactor.js/actions/workflows/test.yml">
    <img src="https://github.com/wwilsman/interactor.js/actions/workflows/test.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/github/wwilsman/interactor.js" >
    <img src="https://codecov.io/github/wwilsman/interactor.js/graph/badge.svg?token=DhhDTLNhXn"/>
  </a>
</p>

## What is interactor.js?

Interactor.js works with anything that runs in a browser, and can power your tests to produce
blazingly fast results. Interactions automatically wait for elements to exist or other assertions to
pass before running, and assertions are automatically run again after they succeed to add a layer of
reliability. Interactions and assertions can also be chained together and reused to create complex
user interactions.

## Installation

```bash
npm install --save-dev interactor.js
```

## Quick start

An interactor instance is provided out-of-the-box so you can immediately start creating
interactions. In the example below, interactions are used with a TodoMVC application to create and
mark a todo item as completed.

```javascript
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

## Table of Contents

- [Core Concepts](#core-concepts)
  - [Automatic Waiting](#automatic-waiting)
  - [Retries & Assertions](#retries--assertions)
  - [Chainable Interface](#chainable-interface)
  - [Scopes & Selectors](#scopes--selectors)
  - [Arrange, Act, Assert](#arrange-act-assert)
- [API](#api)
  - [Core](#core)
    - [I.find(selector)](#ifindselector)
    - [I.arrange(callback)](#iarrangecallback)
    - [I.act(interaction)](#iactinteraction)
    - [I.assert(assertion, failureMessage?)](#iassertassertion-failuremessage)
  - [Actions](#actions)
    - [I.click(selector?)](#iclickselector)
    - [I.type(text, options?)](#itypetext-options)
    - [I.press(keys, options?)](#ipresskeys-options)
    - [I.focus(selector?)](#ifocusselector)
    - [I.blur(selector?)](#iblurselector)
    - [I.trigger(eventName, options?)](#itriggereventname-options)
    - [I.wait(milliseconds)](#iwaitmilliseconds)
  - [Assertions](#assertions)
    - [I.assert.exists()](#iassertexists)
    - [I.assert.visible()](#iassertvisible)
    - [I.assert.text(expected)](#iasserttextexpected)
    - [I.assert.value(expected)](#iassertvalueexpected)
    - [I.assert.attribute(name, expected)](#iassertattributename-expected)
    - [I.assert.property(name, expected)](#iassertpropertyname-expected)
    - [I.assert.matches(cssSelector)](#iassertmatchescssselector)
    - [I.assert.within(cssSelector)](#iassertwithincssselector)
    - [I.assert.contains(selector)](#iassertcontainsselector)
    - [I.assert.disabled()](#iassertdisabled)
    - [I.assert.checked()](#iassertchecked)
    - [I.assert.selected()](#iassertselected)
    - [I.assert.focused()](#iassertfocused)
    - [I.assert.focusable()](#iassertfocusable)
    - [I.assert.overflows(axis?)](#iassertoverflowsaxis)
    - [I.assert.scrollable(axis?)](#iassertscrollableaxis)

## Core Concepts

Interactor.js provides a fluent API for browser automation and testing. It's built around
**automatic waiting** with **retries** to handle dynamic UIs without explicit waits or polling.

### Automatic Waiting

Actions automatically wait for elements to exist and other criteria before executing:

```javascript
// waits for a submit button to appear, not be [disabled](#iassertdisabled), then clicks
await I.click('Submit');
```

### Retries & Assertions

Assertions retry until they pass or timeout:

```javascript
// .exists() is implied
await I.find('Success');
// retries until the element exists and is [visible](#iassertvisible)
await I.find('Success').visible();
```

After assertions pass, they run additional times to ensure stability:

```javascript
// configure a dedicated instance with high reliability
const I = new Interactor({
  // default reliability is 1
  assert: { reliability: 5 }
});

// Passes 6 times total (1 initial check + 5 reliability checks)
await I.find('Stable element');
```

Use `.not` before an assertion to negate it:

```javascript
await I.find('Failure').not.exists();
// exists, but not visible
await I.find('Hidden').not.visible();
```

Use `.then.assert` to chain additional assertions:

```javascript
await I.type('test').into('Search')
  .then.assert.value('test');
await I.click('Submit')
  .then.assert.disabled();
```

### Chainable Interface

The `.then` property enables method chaining as well:

```javascript
await I.find('Username')
  .then.type('alice')
  // chained find searches from the previous element
  .then.find('Password')
  .then.type('secret')
  // some actions accept optional selectors themselves
  .then.click('Login');
```

Each method returns a chainable object, allowing complex sequences to be built declaratively.

### Scopes & Selectors

Use the `find()` method to scope the interactor context to the matching element and return an assert
instance that allows direct assertion calls:

```javascript
await I.find('Email').value('test@example.com');
await I.find('Submit').disabled();

// Chained finds resume DOM traversal from the previous element
await I.find('First').matches('p:nth-child(1)')
  .then.find('Second').matches('p:nth-child(2)');
```

CSS selectors can be defined by using a familiar syntax:

```javascript
await I.find('$(.foobar)');
```

Test attributes have built-in support as well:

```javascript
await I.find('::(foobar)');  // $([data-test="foobar"])
await I.find('::foobar');    // $([data-test-foobar])
await I.find('::foo(bar)');  // $([data-test-foo="bar"])
```

Selectors can be also combined:

```javascript
await I.find('"Foobar" $(:last-child)');
```

For partial text matching, a regular expression is also accepted:

```javascript
await I.find(/^Foo/);
```

Form elements can be selected by their respective labels:

```javascript
// finds <input> associated with <label>Foo</label>
await I.find('Email')
  .then.type('user@example.com');

// finds input with placeholder="Search..."
await I.find('Search...')
  .then.type('query');

// find the label itself
await I.find('"Email" $(label)');
```

#### Best Practices

Prefer user-visible selectors:

```javascript
// good - finds elements like users do
await I.find('Submit').click();

// avoid - implementation details
await I.find('$(button.btn-submit)').click();
```

Use test attributes for dynamic content:

```javascript
// good - stable selector
await I.find('::(user-menu)').click();

// fragile - text may change unless mocking
await I.find('John Doe (Admin)').click();
```

### Arrange, Act, Assert

Interactor can be extended with custom methods and assertions:

```javascript
import { Interactor } from 'interactor.js';

export class AppInteractor extends Interactor {
  setupApplicationForTesting() {
    // use `arrange()` to set up context state that persists between interactions
    return this.arrange(async ctx => {
      ctx.app = await setupApplicationForTesting();
    });
  }

  visit(route) {
    // use `act()` to access and interact with context state or the current element
    return this.act(ctx => {
      // ctx.$ - root element or current element matching any scoped selector
      // ctx.$$ - array of elements matching any current scoped selector
      ctx.app.visit(route);
    });
  }

  // use static `assert` property to quickly register custom assertions
  static assert = {
    location: expected => ({
      assertion: ctx => ctx.app.location === expected,
      failureMessage: `Expected location to be ${expected} but it's not`,
      negatedMessage: `Expected location not to be ${expected} but it is`
    })
  }
}

export const I = new AppInteractor({
  // instance options
  assert: { timeout: 5000 },
  // initial context
  app: { /* ... */ }
});

// custom arrange, act, and assert methods are all chainable
await I.setupApplicationForTesting()
  .then.assert.location('/')
  .then.visit('/redirect')
  .then.assert.location('/other-page');
```

Alternatively, actions and assertions can be registered directly on the class:

```javascript
import { Interactor } from 'interactor.js';

// register custom actions
Interactor.defineAction('visit', function*(route) {
  yield ({ app }) => app.visit(route);
});

// register custom assertions
Interactor.defineAssertion('location', expected => ({
  assertion: ctx => ctx.app.location === expected,
  failureMessage: `Expected location to be ${expected} but it's not`,
  negatedMessage: `Expected location not to be ${expected} but it is`
}));

// arrange context persists across interactions
await I.arrange(async ctx => {
  ctx.app = await setupApplicationForTesting();
});

// use custom actions and assertions
await I.assert.location('/')
  .then.visit('/redirect')
  .then.assert.location('/other-page');
```

## API

### Core

#### `I.find(selector)`

Find and scope to an element.

```javascript
await I.find('Submit');
await I.find('$(.modal)');
await I.find('::(close-button)');
await I.find(/Welcome, .*/);

// assert count
await I.find('List item').times(3);

// chained finds resume DOM traversal from previous element
await I.find('Dialog')
  .then.assert.visible()
  .then.find('Close') // traverses from "Dialog"
  .then.click();
```

#### `I.arrange(callback)`

Set up context state before interactions.

```javascript
await I.arrange(ctx => {
  ctx.set({ customData: 'value' });
});

await I.arrange(ctx => {
  ctx.set({ assert: { timeout: 5000 } });
});
```

#### `I.act(interaction)`

Execute custom interactions.

```javascript
await I.act(({ $ }) => $.scrollIntoView());

await I.act(function*() {
  yield this.find('Button');
  yield ({ $ }) => $.click();
  return ({ $ }) => $.disabled;
});
```

#### `I.assert(assertion, failureMessage?)`
#### `I.assert.not(assertion, negatedMessage?)`

Execute a one-off assertion.

```javascript
await I.assert(({ $ }) => $.disabled, 'Element is not disabled');
await I.assert.not(({ $ }) => $.disabled, 'Element is disabled');
```

### Actions

#### `I.click(selector?)`

Click an element.

- Waits for element to exist and not be [disabled](#iassertdisabled)
- For `<option>` elements, toggles selection in parent `<select>`
- For other elements, calls native `.click()`
- Triggers `input` and `change` events for options

```javascript
await I.click('Submit');
await I.click('$(button.primary)');
await I.find('Menu').then.click();
```

#### `I.type(text, options?)`

Type text into an input or textarea.

- [Focuses](#ifocusselector) element first
- Presses each character individually
- Triggers `input` and `change` events
- [Blurs](#iblurselector) element when done

Options:

- `delay` - Milliseconds between characters
- `replace` - Replace existing value (default: false)
- `range` - Character range to replace `[start, end]`

```javascript
await I.type('hello@example.com').into('$(input)');

// replace any existing value
await I.type('secret', { replace: true }).into('$(input)');

// replace the first 3 characters
await I.type('new', { range: [0, 3] }).into('$(input)');

// delay 100ms between characters
await I.type('slow', { delay: 100 }).into('$(input)');

// chained together
await I.find('Username')
  .then.type('alice')
  .then.type('123')
  .then.assert.value('alice123');
```

#### `I.press(keys, options?)`

Press keyboard keys.

- Triggers `keydown`, `beforeinput`, `input`, `keyup` events
- Supports modifier keys: `Shift`, `Control`, `Alt`, `Meta`
- Handles special keys: `Enter`, `Escape`, `Backspace`, `Delete`, etc.

**Options:**

- `hold` - Keep keys pressed
- `replace` - Replace existing value
- `range` - Character range to replace

```javascript
await I.press('Enter');

// ctrl+a
await I.press(['Control', 'a']);

// produces "A" from holding shift
await I.press('Shift', { hold: true });
  .then.press('a')
```

#### `I.focus(selector?)`

Focus an element.

- Waits for element to exist and be [focusable](#iassertfocusable)
- Calls native `.focus()`

```javascript
await I.focus('Email');
await I.focus('::(search-input)');
await I.find('Email').then.focus();
```

#### `I.blur(selector?)`

Remove focus from an element.

- Waits for element to exist and be [focused](#iassertfocused)
- Calls native `.blur()`

```javascript
await I.blur('Email');
await I.blur('$(input:focus)');
await I.find('Email').then.blur();
```

#### `I.trigger(eventName, options?)`

Dispatch custom events.

**Options:**

- `bubbles` - Event bubbles (default: `true`)
- `cancelable` - Event is cancelable (default: `true`)
- Additional properties added to event object

```javascript
await I.trigger('mouseover');
await I.trigger('click', { button: 0 });
await I.trigger('input', { cancelable: false });
```

#### `I.wait(milliseconds)`

Wait for a specified duration.

```javascript
await I.wait(1000);

// wait 500ms after submit
await I.click('Submit')
  .then.wait(500);
```

### Assertions

#### `I.assert.exists()`

Assert an element exists in the DOM.

```javascript
await I.find('Submit').exists();
await I.find('Error message').not.exists();
```

#### `I.assert.visible()`

Assert an element is visible to users.

- Not hidden by CSS (`display`, `visibility`, `opacity`)
- Inside viewport
- Not covered by other elements

```javascript
await I.find('Modal').visible();
await I.find('Hidden panel').not.visible();

// chained together
await I.find('Has tooltip')
  .then.trigger('mouseenter')
  .then.assert.visible();
```

#### `I.assert.text(expected)`

Assert exact text content.

```javascript
await I.find('$(h1)').text('Welcome, Alice');
await I.find('$(.status)').not.text('Loading...');

// chained together
await I.click('Submit')
  .then.assert.text('Submitting...');
```

#### `I.assert.value(expected)`

Assert form element value.

```javascript
await I.find('Email').value('alice@example.com');
await I.find('Email').not.value('incorrect');

// chained together
await I.find('Email')
  .then.type('foobar')
  .then.assert.value('foobar');
```

#### `I.assert.attribute(name, expected)`

Assert element attribute value.

```javascript
await I.find('Home').attribute('href', '/home');
await I.find('Menu').not.attribute('aria-expanded', 'true');

// chained together
await I.find('Link')
  .then.assert.attribute('target', '_blank')
  .then.assert.attribute('src', 'https://example.com');
```

#### `I.assert.property(name, expected)`

Assert element property value (supports nested paths).

```javascript
await I.find('Remember me').property('checked', true);
await I.find('Submit').property('dataset.testId', 'submit-btn');
await I.find('$(.tags)').property('classList.length', 3);

// chained together
await I.click('Submit')
 .then.assert.property('disabled', false);
```

#### `I.assert.matches(cssSelector)`

Assert element matches a CSS selector.

```javascript
await I.find('Tab').matches('.active');
await I.find('Message').not.matches('.error');

// chained together
await I.click('Submit')
  .then.assert.matches('[disabled]');
```

#### `I.assert.within(cssSelector)`

Assert element is inside a parent matching a CSS selector.

```javascript
await I.find('Submit').within('.modal');
await I.find('Content').not.within('.sidebar');

// chained together
await I.find('Close')
  .then.assert.matches('.close')
  .then.assert.within('dialog');
```

#### `I.assert.contains(selector)`

Assert element contains a descendant.

```javascript
await I.find('$(.card)').contains('Submit button');
await I.find('Form').not.contains('Error message');

// chained together
await I.find('Form')
  .then.assert.contains('Email Address')
  .then.assert.contains('Password');
```

#### `I.assert.disabled()`

Assert element is disabled.

```javascript
await I.find('Submit').disabled();
await I.find('Cancel').not.disabled();

// chained together
await I.click('Submit')
  .then.assert.disabled();
```

#### `I.assert.checked()`

Assert checkbox or radio is checked.

```javascript
await I.find('Accept terms').checked();
await I.find('Opt out').not.checked();

// chained together
await I.click('Remember me')
  .then.assert.checked();
```

#### `I.assert.selected()`

Assert option element is selected.

```javascript
await I.find('Option A').selected();
await I.find('Option B').not.selected();

// chained together
await I.click('Option C')
  .then.assert.selected();
```

#### `I.assert.focused()`

Assert element has focus.

```javascript
await I.find('Email').focused();
await I.find('Password').not.focused();

// chained together
await I.focus('Search')
  .then.assert.focused();
```

#### `I.assert.focusable()`

Assert element can receive focus.

- Not [disabled](#iassertdisabled)
- Document is focusable
- Has non-negative `tabIndex` or is content-editable

```javascript
await I.find('Email').focusable();
await I.find('Hidden input').not.focusable();

// chained together
await I.find('Submit')
  .then.assert.not.disabled()
  .then.assert.focusable();
```

#### `I.assert.overflows(axis?)`

Assert element content overflows its bounds.

```javascript
await I.find('Container').overflows();
await I.find('Container').overflows('y');
await I.find('Container').overflows('x');
await I.find('Container').not.overflows();

// chained together
await I.find('Container')
  .then.assert.matches('.overflow-x')
  .then.assert.overflows('x')
```

#### `I.assert.scrollable(axis?)`

Assert element is scrollable.

- Element has overflow
- CSS allows scrolling (`overflow: scroll` or `auto`)

```javascript
await I.find('List').scrollable();
await I.find('List').scrollable('y');
await I.find('List').scrollable('x');
await I.find('List').not.scrollable();

// chained together
await I.find('List')
  .then.assert.matches('.scrollable-x')
  .then.assert.scrollable('x')
```
