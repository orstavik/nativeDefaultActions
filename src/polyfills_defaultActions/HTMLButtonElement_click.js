export const clickButtonDefaultAction = {
  element: HTMLButtonElement,
  event: {
    type: "click"
  },
  elementFilter: function buttonClick_filter(element) {
    return element.form && (element.type === "submit" || element.type === "reset");
  },
  defaultAction: function buttonClick_action(event, element) {
    if (element.type === "submit")
      element.form.requestSubmit();
    else if (element.type === "reset")
      element.form.reset();
  },
  lowestWins: true,
  composed: true,
  preventable: true,
  targetOnly: false
};