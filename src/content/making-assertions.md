---
title: Making Assertions
---

## Asynchronous assertions

Interactor assertions are convergent and run repeatedly until they pass or until
the interactor timeout has been exceeded, at which point it will throw the last
error it received. There are several built-in assertions that come with
interactor.js, and by omitting the selector for a built-in assertion, the
assertion is made against the interactor's own scoped element.

``` javascript
it('is a disabled card component', async () => {
  await new Interactor('.card-component')
    // ".card-component" has a ".disabled-card" class
    .assert.matches('.disabled-card')
    // the nested <button> has a ".primary" class
    .assert.matches('button', '.primary')
    // the nested <button> is also disabled
    .assert.disabled('button');
});
```

All built-in assertions, and assertions auto-defined from custom properties, can
be passed a custom matcher function which is given the result of the property as
it's only argument. Assertions that test properties which return strings can
also be passed a regular expression to test against. Providing no arguments to
an assertion will assert the property's truthiness.

``` javascript
// asserting with a custom matcher
await new Interactor('.intro')
  .assert.text(content => content.length <= 100);

// asserting against a regexp
await new Interactor('.heading')
  .assert.text(/welcome/i);

// asserting truthiness
await new Interactor('.checkbox')
  .assert.checked();
```

Built-in assertions can be found [here](/assertions).

## Negating assertions

Assertions can also be negated by using `assert.not` followed by the assertion
method.

``` javascript
it('is not disabled card component', async () => {
  await new Interactor('.card-component')
    // ".card-component" does not have a ".disabled-card" class
    .assert.not.matches('.disabled-card')
    // the nested <button> has a ".primary" class
    .assert.matches('button', '.primary')
    // the nested <button> is not disabled
    .assert.not.disabled('button');
});
```

## Asserting changes

By default, assertions that are chained together are all run at the same
time. In the above example, if the `<button>` is not disabled the entire chain
of assertions is run again and again until they all pass or until the
interactor's timeout has been exceeded (and subsequently throws an error). When
you interrupt a sequential chain of assertions with an action, only those
assertions chained together are run at the same time.

``` javascript
it('disables the submit button while submitting', async () => {
  await new Interactor('.signup-form')
    .type('.name', 'Name Namerson')
    .type('.email', 'email@domain.tld')
    .type('.pass', 'CorrectHorseBatteryStaple')
    // the following assertions run at the same time
    .assert.not.matches('.has-errors')
    .assert.matches('.submit', '.primary')
    .assert.not.disabled('.submit')
    // click the ".submit" button
    .click('.submit')
    // assert the ".submit" button is now disabled
    .assert.disabled('.submit');
});
```

You can group assertions together without calling an action by using the
`assert.validate()` method. This is useful when something is expected to change
without user input; such as a notification appearing, and then disappearing.

``` javascript
it('shows a notification and subsequently removes it', async () => {
  await new Interactor('.notification-area')
    .assert.exists('.error-notification')
    .assert.validate()
    .assert.not.exists('.error-notification')
});
```

<!-- hint: info -->
Since assertions are asynchronous, the first assertion will run until the
notification exists, and the second assertion will run until it no longer
exists. If the notification never appears, the first assertion will
fail. Likewise if it lingers for too long, the second assertion will fail.
<!-- endhint -->

## Asserting against time

Sometimes, like in the example above, it is better to assert that the
notification is visible for a certain amount of time before it disappears. There
is a method for that as well: `assert.remains()`. This does the same thing
`assert.validate()` does, but has the benefit of asserting that the previous set
of assertions continues to pass, once passing, for a specific amount of time (in
milliseconds).

``` javascript
it('shows a notification and subsequently removes it', async () => {
  await new Interactor('.notification-area')
    .assert.exists('.error-notification')
    .assert.remains(1000) // notification remains for 1 second
    .assert.not.exists('.error-notification')
});
```

<!-- hint: warning -->
The timeout passed to `assert.remains()` must still be within the interactor's
own timeout. If the given timeout is greater than the interactor's timeout, it
will be capped and the following assertions will fail due to exceeding the total
timeout. So if asserting something remains for 2 seconds or longer, be sure to
adjust the interactor timeout accordingly as well.
<!-- endhint -->
