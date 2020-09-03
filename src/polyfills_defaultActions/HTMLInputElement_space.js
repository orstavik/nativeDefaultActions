//todo we need to know which of the input elements that turn a space into a click??
//todo are there other buttons on the keyboard that also are converted into clicks??

const spacyTypes =
  "[type=reset]," +
  "[type=submit]," +
  "[type=button]," +
  "[type=file]," +
  "[type=radio]," +
  "[type=checkbox]" ;
  // "input[type=date]," +//maybe??
  // "input[type=month]," +
  // "input[type=week]," +
  // "input[type=time]," +
  // "input[type=datetime-local]," ;

export const spaceOnInputClickDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "space"
  },
  stateFilter: function spaceOnInput_filter(event, el) {
    return el.matches(spacyTypes);
  },
  defaultAction: function spaceToClickOnInput(event, el) {
    const click = new MouseEvent("click", {composed: true, bubbles: true});
    click.async = event.async;
    click.isTrusted = true;
    el.dispatchEvent(click);
  },
  repeat: "lowestWins",
  preventable: true
};