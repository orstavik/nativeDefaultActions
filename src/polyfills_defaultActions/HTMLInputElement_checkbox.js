export const InputCheckboxClickDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "click",
    // isTrusted: false/true //to .click() or checkbox.dispatchEvent(new MouseEvent("click")) WILL trigger the default action.
  },
  apriori: function (event, el) {
    const innerTarget = event.composedPath()[0];
    if (!(innerTarget instanceof HTMLInputElement) || innerTarget.type !== "checkbox")
      return false;
    innerTarget.checked = !innerTarget.checked;
    Object.defineProperty(event, "preventDefault", {
      value: function () {
        innerTarget.checked = !innerTarget.checked;
        Object.getPrototypeOf(this).preventDefault.call(this);
      }
    });
    return true;
  },
  stateFilter: function (event, el) {
    return el.type === "checkbox";
  },
  defaultAction: function doNothing() {
    "The default action of input type='checkbox' is done apriori/prepropagation/before propagation."+
      "This causes some problems, when you either change the type of an input element from/to checkbox during propagation.";
  },
  repeat: "lowestWins",
  preventable: true
};

export const InputCheckboxSpaceDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    code: "Space"
  },
  stateFilter: function (event, el) {
    return el.type === "checkbox";
  },
  defaultAction: function keypress_then_click(event, element) {
    const keypress = new KeyboardEvent(keypress, event);
    keypress.isTrusted = true;
    keypress.async = true;
    element.dispatchEvent(keypress);
    // there is no check if(!keypress.defaultPrevented)
    // we don't care about keypress.defaultPrevented. .preventDefault() only works on the keydown event.
    const click = new MouseEvent("click", {composed: true, bubbles: true});
    click.isTrusted = true;
    click.async = true;
    element.dispatchEvent(click);
  },
  repeat: "lowestWins",
  preventable: true
};