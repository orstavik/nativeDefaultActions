//expose the requestSelect method of the HTMLSelectElement
export function requestSelect(option) {
  function optionSelectEndMouseup() {
    //option.color = orange?? //there is no way to trigger this behavior from js... It is completely hidden in the browser.
    const input = new InputEvent("input", {bubbles: true, composed: true});
    this.dispatchEvent(input);//todo this should be the select, no?                                                             ゜
    const change = new InputEvent("change", {bubbles: true, composed: false});
    this.dispatchEvent(change);
  }

  function optionsSelectEndMousemoveChrome(e) {
    !(e.buttons & 1) && optionSelectEndMouseup();
  }

  this.value = option.value;    //changes the selected option. The option.value is always something,
  //This is done by all browsers: Chrome, FF(, Safari??)
  window.addEventListener("mouseup", optionSelectEndMouseup, {capture: true, once: true, first: true});

  //This is done only in Chrome (and Safari??), but not FF
  window.addEventListener("mousemove", optionsSelectEndMousemoveChrome, {capture: true, once: true, first: true});
  // in Chrome the alert() function will cancel the change and input events..
  // how to catch that event/function call without highjacking the window.alert() function, i don't know.
  // window.addEventListener("alert", function () {
  //   window.removeEventListener("mouseup", optionSelectEndMouseup, {capture: true, once: true, first: true});
  //   window.removeEventListener("mousemove", optionsSelectEndMousemoveChrome, {capture: true, once: true, first: true});
  // }, {capture: true, once: true, first: true});
}

