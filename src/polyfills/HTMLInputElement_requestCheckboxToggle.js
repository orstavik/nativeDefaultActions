//expose the requestToggle method of the HTMLInputElement
export function requestCheckboxToggle() {
  if (this.type !== "checkbox")
    throw new Error("requestCheckboxToggle() should only be possible to invoke on input type=checkbox");
  const beforeinput = new InputEvent("beforeinput", {bubbles: true, composed: "don't remember"});
  this.dispatchEvent(beforeinput);
  if (beforeinput.defaultPrevented)
    return;
  this.checked = !this.checked;
  const input = new InputEvent("input", {bubbles: true, composed: "don't remember"});
  this.dispatchEvent(input);
}