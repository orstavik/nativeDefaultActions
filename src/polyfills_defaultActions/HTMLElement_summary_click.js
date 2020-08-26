export const clickSummaryDefaultAction = {
  element: HTMLElement, //todo this is a bad rule. because it can match so many elements. There should be an HTMLSummaryElement. This should be added as a request.
  event: {
    type: "click"
  },
  elementFilter: function summaryClick_filter(el) {
    return el.matches("summary:first-of-type") && el.parentNode instanceof HTMLDetailsElement;
  },
  defaultAction: function summaryTogglesDetails(event, element) {
    element.parentNode.open = !element.parentNode.open;
  },
  lowestWins: true,
  composed: true,
  preventable: true,
  targetOnly: false
};