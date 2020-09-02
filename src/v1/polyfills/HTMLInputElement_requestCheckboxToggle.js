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

export const implicableSelector =
  "input[type=text]:focus," +
  "input[type=search]:focus," +
  "input[type=url]:focus," +
  "input[type=telephone]:focus," +
  "input[type=email]:focus," +
  "input[type=password]:focus," +
  "input[type=date]:focus," +
  "input[type=month]:focus," +
  "input[type=week]:focus," +
  "input[type=time]:focus," +
  "input[type=datetime-local]:focus," +
  "input[type=number]";

const aFormsDefaultButton =
  "input:default," +
  "button:default," +
  ":not(form) input:default," +
  ":not(form) button:default";

/**
 * An <input> element can imply submission (ie convert a submit to a click on a default (submit) button or trigger the
 * submit method of the <form> element directly if it is:
 *
 * a) ":implicable" ie.
 *        input[type=text]:focus,
 *        input[type=search]:focus,
 *        input[type=url]:focus,
 *        input[type=telephone]:focus,
 *        input[type=email]:focus,
 *        input[type=password]:focus,
 *        input[type=number]:focus",
 *        input[type=date]:focus,          // * Chrome deviate from spec
 *        input[type=month]:focus,         // *
 *        input[type=week]:focus,          // *
 *        input[type=time]:focus,          // *
 *        input[type=datetime-local]:focus,// *
 *
 * b) either:
 *    1) the <form> owner has a default button, in which case the default button will be pressed,  or
 *    2) the <input> element which is pressed "Enter" on is the only 'input:implicable' element under this <form> owner
 *
 * Note: * Chrome behavior deviates from the spec., FF and Safari.
 *       In Chrome input type=[time/date/week/month/datetime-local] are not ":implicable".
 *       It is unclear which behavior is better.
 * Note: todo maybe request the CSS pseduo class "input:implicable"?
 *
 * @param input
 * @returns an <input type=submit>, <input type=image> or <button type=submit> if the form has a default button
 *          the input's {<form> element} if the <input> element is the only :implicable element for the <form>
 *          {undefined} if the <input> doesn't imply submission.
 */
export function implicable(input) {
  // if (!input.matches(implicableSelector))   //this should be part of the :implicable algorithm, but here we have already tested this in the selector
  //   return undefined;
  const form = input.form;
  if (!form)
    return undefined;
  const defaultButton = form.querySelector(aFormsDefaultButton);
  if(defaultButton)
    return defaultButton;
  const lonesomeImplicable = form.querySelectorAll(implicableControllers);
  if(lonesomeImplicable.length === 1){
    if(lonesomeImplicable[0] !== input)
      throw new Error("omg, bug #CSSx666. Error in the implicableControllers CSS query. This should never happen, it is not your fault.");
    return input;
  }
  return undefined;
}

export function requestImplicitSubmission(input, target) {
  target = target || implicable(input);
  if (target instanceof HTMLFormElement)
    target.requestSubmit();
  else if(target instanceof HTML)

  if(lonesomeImplicable.length === 1){
    if(lonesomeImplicable[0] !== input)
      throw new Error("omg, bug #CSSx666. Error in the implicableControllers CSS query. This should never happen, it is not your fault.");
    return input;
  }
  return null;
}