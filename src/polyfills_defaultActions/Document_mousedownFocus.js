function isFocusable(el) {
  return !el.disabled && el.matches("a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contentEditable=true]");
}

export const mousedownFocusDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  defaultAction: function mousedownFocus(event, element) {
    for (let el of event.composedPath())
      isFocusable(el) && el.focus();
  }
};