// Interactor method to add a disabled assertion and click action to the interactor's queue.
export default function click() {
  return this
    .assert.not.disabled()
    .exec($element => $element.click());
}
