---
title: Getting Started
description: Start using Interactor.js
---

First, install interactor.js using your preferred package manager.

<!-- tabbed: yarn -->
``` sh
$ yarn add --dev interactor.js
```
<!-- tabbed: npm -->
``` sh
$ npm install --save-dev interactor.js
```
<!-- endtabbed -->

If you're using babel and you wish to be able to use the decorator and class
property syntax, you'll also need to install the appropriate babel plugins.

<!-- hint: warning -->
There are changes coming soon to the decorator syntax and the latest TC39
decorators proposal recommends using "legacy" decorators until those changes are
ready. For more information, [check out their FAQ](https://github.com/tc39/proposal-decorators#faq).
<!-- endhint -->

<!-- tabbed: yarn -->
``` bash
$ yarn add --dev \
  @babel/plugin-proposal-decorators \
  @babel/plugin-proposal-class-properties
```
<!-- tabbed: npm -->
``` bash
$ npm install --save-dev \
  @babel/plugin-proposal-decorators \
  @babel/plugin-proposal-class-properties
```
<!-- endtabbed -->

<!-- tabbed: .babelrc -->
``` javascript
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
}
```
<!-- endtabbed -->

Next, start using interactors!

<!-- hint: info -->
If classes and decorators aren't available in your environment, or if you just
don't like the page-object pattern, don't worry! Interactor.js offers the
ability to define custom interactors via plain old JavaScript objects. You can
even just use all of the available actions directly without defining any custom
interactors at all!
<!-- endhint -->
