function selectionProcessEnds(select) {
  //option.color = orange?? //there is no way to trigger this behavior from js... It is completely hidden in the browser.
  const input = new InputEvent("input", {bubbles: true, composed: true});
  select.dispatchEvent(input);
  const change = new InputEvent("change", {bubbles: true, composed: false});
  select.dispatchEvent(change);
}

function requestSelect(select, option) {
  select.value = option.value;    //changes the selected option. The option.value is always something,

  //This is done by all browsers: Chrome, FF(, Safari??)
  window.addEventListener("mouseup", e => selectionProcessEnds(select), {capture: true, once: true, first: true});

  //This is done only in Chrome (and Safari??), but not FF
  window.addEventListener("mousemove", e=> !(e.buttons & 1) && selectionProcessEnds(select), {capture: true, once: true, first: true});
  // in Chrome the alert() function will cancel the change and input events..
  // how to catch that event/function call without highjacking the window.alert() function, i don't know.
  // window.addEventListener("alert", function () {
  //   window.removeEventListener("mouseup", optionSelectEndMouseup, {capture: true, once: true, first: true});
  //   window.removeEventListener("mousemove", optionsSelectEndMousemoveChrome, {capture: true, once: true, first: true});
  // }, {capture: true, once: true, first: true});
}

export const mousedownOptionDefaultAction = {
  element: HTMLOptionElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  elementFilter: function navigate_filter(el) {
    return el.parentNode instanceof HTMLDetailsElement || (
      el.parentNode instanceof HTMLOptGroupElement &&
      el.parentNode.parentNode instanceof HTMLDetailsElement
    );
  },
  defaultAction: function optionRequestSelect(ev, el) {
    const select = el.parentNode instanceof HTMLOptGroupElement ? el.parentNode.parentNode : el.parentNode;
    requestSelect.call(select, el);
  },
  repeat: "lowestWins",
  preventable: true,
  targetOnly: true
};