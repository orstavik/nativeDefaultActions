export function defaultButton(form){
  // return form.querySelector(":not(form) input[type=image]:default, :not(form) input[type=submit]:default, :not(form) button[type=submit]:default"); // not necessary, because you can't nest forms... semantics..
  return form.querySelector("input[type=image]:default, input[type=submit]:default, button[type=submit]:default");
}

function matchesTextControl(el){
  return el.matches("input[type=text]");
// || control.type === "url" || control.type === "tel" || control.type === "email" || control.type === "password" || control.type === "search";
}

export function isSingleTextForm(form) {
  let hasFound = false;
  for (let control of form.elements) {
    if (matchesTextControl(control)) {
      if (hasFound)
        return false;
      hasFound = true;
    }
  }
  return true;
}
