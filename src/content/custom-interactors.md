---
title: Custom Interactors
---

## Composition

Interactors were built to be composable. Using the class decorator, you can
create your own custom interactors by composing other interactors, actions, and
special property creators. The class decorator maps these properties into
getters and methods that are wrapped to return immutable instances of the parent
class. All custom interactors inherit from the base `Interactor` class.

<!-- tabbed: login-interactor.js -->
``` javascript
import interactor, {
  matches,
  type,
  text,
  click
} from 'interactor.js';

@interactor class FieldInteractor {
  label = text('.label');
  type = str => type('input', str);
  hasError = matches('.has-error');
  errorMessage = text('.error-message');
}

@interactor class LoginInteractor {
  // when no scope is given to a new instance, use this scope
  static defaultScope = '.login-form';

  email = new FieldInteractor('.email');
  password = new FieldInteractor('.password');
  submit = click('.submit');
}

export default LoginInteractor;
```
<!-- tabbed: login-test.js -->
``` javascript
import LoginInteractor from './login-interactor';

// the default scope is ".login-form"
const loginForm = new LoginInteractor();

describe('logging in', () => {
  /* ...application/component setup... */

  it('has email and password fields', () => {
    expect(loginForm.email.exists).toBe(true);
    expect(loginForm.email.label).toBe('Email address');
    expect(loginForm.password.exists).toBe(true);
    expect(loginForm.password.label).toBe('Password');
  });

  it('shows an error on blur for invalid emails', async () => {
    await loginForm
      // children methods return instances of the parent interactor
      .email.type('@invalid.email')
      .email.blur();
      // the error might appear milliseconds after blurring, so
      // let's take advantage of interactor's async assertions
      .assert.email.hasError()
      .assert.email.errorMessage('Invalid email address');
  });

  it('can successfully login', async () => {
    await loginForm
      .email.type('email@domain.tld')
      .password.type('CorrectHorseBatteryStaple')
      .submit()
      // assert that a user logged in asynchronously
      .assert(() => {
        expect(user.loggedIn).toBe(true);
      });
  });
});
```
<!-- endtabbed -->

Built-in property creators can be found [here](/properties/), and built-in
actions can be found [here](/actions/).

<!-- hint: info -->
It's **highly** recommended that you build custom component interactors for unit
tests, and then use those component interactors to build page interactors for
acceptance tests.
<!-- endhint -->

## Custom assertions

Custom properties created using the [built-in property creators](/properties/)
automatically create custom assertions as well.

In the example above, we defined a few custom interactor properties for the
field interactor. Then in our tests, we asserted against those properties both
by referencing the property, and by using the auto-defined assertion.

``` javascript
import interactor, {
  matches,
  text
} from 'interactor.js';

@interactor class FieldInteractor {
  label = text('.label');
  hasError = matches('.has-error');
  errorMessage = text('.error-message');
}

// ...

// use any assertion library
expect(field.label).toBe('Password');
expect(field.hasError).toBe(true);
expect(field.errorMessage).toBe('Incorrect password');

// or use interactor's async assertions
await field
  .assert.label('Password')
  .assert.hasError()
  .assert.errorMessage('Incorrect password');
```

Nested assertions work the same way as nested actions and return the top-most
parent interactor. Like other assertions, they are also grouped with neighboring
assertions until an action is called.

``` javascript
import interactor, {
  collection
  property,
  scoped
} from 'interactor.js';

@interactor class FormInteractor {
  name = scoped('input');

  options = collection('[type=radio]', {
    checked: property('checked')
  });

  submit = scoped('submit');
}

// ...

new FormInteractor()
  // the following assertions are grouped together
  .assert.name.value('Name Namerson')
  .assert.options(2).checked()
  .assert.submit.not.disabled()
  // assertion after actions are grouped separately
  .submit.click()
  .assert.submit.matches('.loading')
  .assert.submit.disabled()
```

### Advanced assertions

Assertions can also be added to custom interactors using the static `assertions`
property. An assertion defined this way can be a function that throws an error
or returns a boolean value. To control the error message, return an object
consisting of the result of the validation and a message function called when an
assertion fails. This is especially recommended when negating custom assertions,
otherwise a generic error message will be thrown.

<!-- tabbed: field-interactor.js -->
``` javascript
import interactor, {
  matches,
  text
} from 'interactor.js';

@interactor class FieldInteractor {
  static assertions = {
    hasError() {
      let result = this.hasError;

      return {
        result,
        message: () => result
          ? `error found - "${this.errorMessage}"`
          : 'no errors found'
      }
    }
  };

  hasError = matches('.has-error');
  errorMessage = text('.error-message');
}

export default FieldInteractor;
```
<!-- tabbed: field-test.js -->
``` javascript
import FieldInteractor from './field-interactor';

const email = new FieldInteractor('.email');

describe('the email field', () => {
  it('has an error', async () => {
    // might throw `no errors found`
    await email.assert.hasError();
  });

  it('has no errors', async () => {
    // might throw `error found - "Invalid email address"`
    await email.assert.not.hasError();
  });
});
```
<!-- endtabbed -->

## Extending custom interactors

All interactors extend from the base `Interactor` class, and so inherit methods,
properties, and assertions from that class. To extend from custom interactors,
just use the `extends` keyword in conjunction with the `@interactor` decorator.

``` javascript
import interactor from 'interactor.js';

@interactor class FieldInteractor { /* ... */ }
@interactor class PasswordInteractor extends FieldInteractor { /* ... */ }

expect(new PasswordInteractor()).toBeInstanceOf(PasswordInteractor);
expect(new PasswordInteractor()).toBeInstanceOf(FieldInteractor);
expect(new PasswordInteractor()).toBeInstanceOf(Interactor);
```

## Without class properties or decorators

Some environments may not be able to transpile class properties or decorators,
or maybe you just have an aversion to classes. Interactor.js provides a static
`from` method to create custom interactors from plain old JavaScript objects. All
custom interactors also have a static `from` method.

``` javascript
import { Interactor, type, click } from 'interactor.js';

const LoginInteractor = Interactor.from({
  // static properties are handled via the `static` keyword
  static: {
    // the class name is used in error messages when a scope
    // cannot be inferred; since pojos do not have names, a
    // static name property is recommended
    name: 'LoginInteractor',
    // the defaultScope is used when invoked without a scope
    defaultScope: '.login-form',
    // custom assertions are also defined by a static property
    assertions: { /* ... */ }
  },

  typeEmail: email => type('.email', email),
  typePassword: pass => type('.password', pass),
  submit: click('.submit')
});
```

New interactor instances can also be created using a static `scoped` method, or
by passing an custom interactor class to the [`scoped`](helpers/scoped)
helper.

``` javascript
import { scoped } from 'interactor.js';

// new keyword
let loginForm = new LoginInteractor('.login-form');
// static scoped method
let loginForm = LoginInteractor.scoped('.login-form');
// using the interactor creator
let loginForm = scoped('.login-form', LoginInteractor);
```

<!-- hint: info -->
In both examples, the selector is optional since `LoginInteractor` declares a
static `defaultScope` property.
<!-- endhint -->
