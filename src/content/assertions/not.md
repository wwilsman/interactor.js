---
title: Not
---

`#assert.not`

The `not` prefix can be used before any assertion and will negate the results of
that assertion.

``` javascript
await new Interactor('.signup-form')
  .assert.not.disabled('input.email')
  .assert.not.matches('.has-errors')
```

When a custom assertion is negated, a generic error will be thrown unless the
custom assertion returns an object consisting of a `result` and an error
`message`. This error message is assumed to account for the results of the
validation.

``` javascript
@interactor class FormInteractor {
  static assertions = {
    hasErrors() {
      let hasErrors = this.matches('.has-errors');

      return {
        result: hasErrors,
        message: () => {
          if (hasErrors) {
            return 'there were errors with the form';
          } else {
            return 'no errors were found';
          }
        }
      }
    }
  }
}

// might throw "no errors were found"
await new FormInteractor('.signup-form')
  .assert.hasErrors()

// might throw "there were errors with the form"
await new FormInteractor('.signup-form')
  .assert.not.hasErrors()
```
