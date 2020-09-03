export const clickButtonSubmitDefaultAction = {
  element: HTMLButtonElement,
  event: {
    type: "click"
  },
  stateFilter: function buttonClick_filter(event, element) {
    return element.form && element.type === "submit";
  },
  defaultAction: function clickRequestSubmit(event, element) {
    element.form.requestSubmit();
  },
  repeat: "lowestWins",
  preventable: true
};

export const clickButtonResetDefaultAction = {
  element: HTMLButtonElement,
  event: {
    type: "click"
  },
  stateFilter: function buttonClick_filter(event, element) {
    return element.form && element.type === "reset";
  },
  defaultAction: function clickRequestReset(event, element) {
    element.form.reset();
  },
  repeat: "lowestWins",
  preventable: true
};

export const enterButtonDefaultAction = {
  element: HTMLButtonElement,
  event: {
    type: "keydown",
    isTrusted: true,   //assuming isTrusted is necessary
    key: "Enter"
  },
  defaultAction: function buttonEnter(event, element) {
    const click = new MouseEvent("click", {composed: true, bubbles: true});
    click.async = true;
    click.isTrusted = true; //no way to realize this in JS
    element.dispatchEvent(click);
  },
  repeat: "lowestWins", //todo test this
  preventable: true     //todo test this
};