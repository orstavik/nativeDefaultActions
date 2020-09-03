export const keydownOnTextareaDefaultAction = {
  element: HTMLTextAreaElement,
  event: {
    type: "keydown",
    isTrusted: true
  },
  stateFilter: function notTab(event, el) {
    return event.key !== "tab"; //todo is this how tab is written??
  },
  defaultAction: function enterOnInputText(event, el) {
    //todo this is really complex and involves the composition / dead key events.
  },
  repeat: "lowestWins",
  preventable: true
};