---
title: What is Interactor.js?
description: |
  Interactor.js is a composable, immutable, asynchronous way to
  interact with components or applications like a user would.
---

Interactors work anywhere there is DOM, and run alongside your tests to produce
blazingly fast results. They automatically wait for elements to exist in the DOM
before interacting with them and also provide a simple interface for making
asynchronous assertions against the DOM as well.

Interactors are meant to help write tests in a way a user interacts with your
component or application. Instead of calling methods and expecting side effects,
interactors work on the premise that a user will interact with your components
or application and expect feedback from those interactions.

[Getting Started](getting-started)

Interactor.js provides several common actions out of the box and makes it a
breeze to define your own custom actions. Actions return interactors, which
automatically run when using `await`. You can chain additional actions together
to create more complex actions, and since interactors are lazy and immutable,
you can save and reuse those complex actions throughout your tests.

[Using Actions](using-actions)

The real power of interactors comes from the ability to define custom
interactors and compose those custom interactors together using a page-object
pattern. Custom interactors can be written for unit testing common components,
and those interactors can then be used to build page interactors for acceptance
testing applications.

[Custom Interactors](custom-interactor)
