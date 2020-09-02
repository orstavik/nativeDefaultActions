const implicableSelector =
  "input[type=text]," +
  "input[type=search]," +
  "input[type=url]," +
  "input[type=telephone]," +
  "input[type=email]," +
  "input[type=password]," +
  "input[type=date]," +
  "input[type=month]," +
  "input[type=week]," +
  "input[type=time]," +
  "input[type=datetime-local]," +
  "input[type=number]";

const defaultButtonSelector =
  "input[type=submit]:default," +
  "button[type=submit]:default," +
  "input[type=image]:default";

export const enterOnInputTextDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "Enter"
  },
  stateFilter: function enterOnInputText_filter(event, el) {
    return el.type === "text" &&
      el.form && (
        el.form.querySelector(defaultButtonSelector) ||
        el.form.querySelectorAll(implicableSelector).length === 1
      );
  },
  defaultAction: function enterOnInputText(event, el) {
    const click = new MouseEvent("click", {composed: true, bubbles: true});
    click.async = event.async;
    click.isTrusted = true;
    const defaultButton = el.form.querySelector(defaultButtonSelector);
    if (defaultButton)
      defaultButton.dispatchEvent(click);
    el.form.requestSubmit();
  },
  repeat: "lowestWins",   //todo are there any edge cases here where this might not be true??  make tests for this
  preventable: true
};

export const enterOnInputSubmitResetButtonDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "Enter"
  },
  stateFilter: function enterOnInputSubmitResetButton_filter(ev, el) {
    return el.type === "submit" || el.type === "button" || el.type === "reset";
  },
  defaultAction: function enterOnInputSubmitResetButton(event, el) {
    const click = new MouseEvent("click", {composed: true, bubbles: true});
    click.async = event.async;
    click.isTrusted = true;
    el.dispatchEvent(click);
  },
  repeat: "lowestWins",
  preventable: true
};

