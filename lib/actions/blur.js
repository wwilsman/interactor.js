export default function blur() {
  return this
    .assert.focused()
    .exec($element => $element.blur());
}
