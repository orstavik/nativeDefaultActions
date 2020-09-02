export const mousedownFocusDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  elementFilter: function mousdownFocus_filter_focusable(event, el) {
    return !el.disabled && el.matches("a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contentEditable=true]");
  },
  defaultAction: function MousedownFocuses(event, element) {
    element.focus();
  },
  repeat: "once", //todo this should be repeat: document
  preventable: true  //todo verify an make test case
};