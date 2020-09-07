export const InputCheckboxClickDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "click",
    // isTrusted: false/true //to .click() or checkbox.dispatchEvent(new MouseEvent("click")) WILL trigger the default action.
  },
  apriori: function (event) {
    const innerTarget = event.composedPath()[0];
    if (!(innerTarget instanceof HTMLInputElement) || innerTarget.type !== "checkbox")
      return false;
    innerTarget.checked = !innerTarget.checked;
    Object.defineProperty(event, "preventDefault", {
      value: function (...args) {
        innerTarget.checked = !innerTarget.checked;
        Object.getPrototypeOf(this).preventDefault.call(this, ...args);
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

//https://html.spec.whatwg.org/multipage/input.html#radio-button-group
function checkedRadioSibling(radio){
  return radio.form ?
    Array.from(radio.form.elements).find(el => el.type === "radio" && el.name === radio.name && el.checked) :
    radio.getRootNode().querySelector(`:not(form) input[type=radio][name='${(radio.name)}']:checked`);
}

export const InputRadioClickDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "click",
    // isTrusted: false/true //to .click() or radio.dispatchEvent(new MouseEvent("click")) WILL trigger the default action.
  },
  apriori: function (event) {
    const el = event.composedPath()[0];
    if (!(el instanceof HTMLInputElement) || el.type !== "radio" || el.checked || !el.name)
      return false;
    const relevantTarget = checkedRadioSibling(el);
    relevantTarget.checked = false;
    el.checked = true;

    Object.defineProperty(event, "preventDefault", {
      value: function (...args) {
        el.checked = false;
        relevantTarget.checked = true;
        Object.getPrototypeOf(this).preventDefault.call(this, ...args); //todo this is not used in the native context...
      }
    });
    return true;
  },
  stateFilter: function (event, el) {
    return el.type === "radio";
  },
  defaultAction: function doNothing() {
    "The default action of input type='radio' is done apriori/prepropagation/before propagation." +
    "This causes some problems, when you either change the type of an input element from/to radio during propagation." +
    "This also causes some problems when you try to read the state of the checkbox during the click event propagation " +
    "(as it has changed in advance, which is unexpected).";
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
    return el.type === "checkbox" || el.type === "radio";
  },
  defaultAction: function keypress_then_click(event, element) {
    const keypress = new KeyboardEvent("keypress", event);
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