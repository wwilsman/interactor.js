---
title: Scroll
---

## Method

`#scroll([selector], options)`

- **selector** - optional selector to scroll a nested element
- **options** - scroll options
  - **left** - amount in pixels to scroll left
  - **top** - amount in pixels to scroll top
  - **x** - alias for `left`
  - **y** - alias for `top`
  - **wheel** - triggers a wheel event when `true` (default `false`)
  - **frequency** - how many times to trigger the scroll event (default `1`)

The `interactor.scroll()` method will trigger a scroll event on the interactor's
element and scroll the specified distance when the interactor is run. When given
a `selector`, it will trigger a scroll event and scroll a nested element
instead. It returns a new instance of the interactor with the action added to
it's queue.

At least one of the directions is required when scrolling, but both may also be
provided. When `wheel` is `true` a wheel event is triggered before the scroll
event and is given an opportunity to cancel the scroll event. The `frequency`
option determines how many times over the course of scrolling to trigger the
scroll event. For example, given a `top` value of `100` and a `frequency` of `5`
the scroll event will be triggered once every 20px.

``` javascript
import { Interactor } from 'interactor.js';

await new Interactor('.container').scroll({ top: 100 });
await new Interactor('.wrapper').scroll('.container', { top: 100 });

await new Interactor('.container').scroll({
  top: 100,
  wheel: true,
  frequency: 10
});
```

<!-- hint: warning -->
The `scroll()` method will first assert that the element has overflow in the
specified direction intended to scroll.
<!-- endhint -->

## Action

`scroll(selector, options) => Interactor`

- **selector** - element selector to blur
- **options** - scroll options (see above)

The `scroll()` action returns an interactor which will trigger a scroll event on
the specified element and scroll the specified distance. The returned interactor
can be run by itself, or used when composing a custom interactor.

See the interactor [method above](#method) for details on the various options.

``` javascript
import interactor, { scroll } from 'interactor.js';

await scroll('.container', { top: 100 });

@interactor class PageInteractor {
  scrollDown100 = scroll('.container', { top: 100 });
  scrollDownBy = top => scroll('.container', { top });
}

await new PageInteractor().scrollDown100();
await new PageInteractor().scrollDownBy(500);
```

<!-- hint: warning -->
The `scroll()` action will first assert that the element has overflow in the
specified direction intended to scroll.
<!-- endhint -->
