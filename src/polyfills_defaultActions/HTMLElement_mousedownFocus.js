export const mousedownFocusDefaultAction = {
  element: HTMLElement,
  event: {
    type: "click",
    isTrusted: true,
    button: 0
  },
  elementFilter: function mousdownFocus_filter_focusable(el) {
    return !el.disabled && el.matches("a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contentEditable=true]");
  },
  defaultAction: function MousedownFocuses(event, element) {
    element.focus();
  },
  lowestWins: false,
  preventable: true,  //todo verify an make test case
  targetOnly: false,
  composed: true     //todo here is smart usecase for a bounced focus event instead..
};