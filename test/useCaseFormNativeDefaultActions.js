
//<select>
//  <option1>
//  <div>
//    <option2>
//  <optgroup>
//    <option3>
//    <span>
//      <option4>
function makeFormBranch(buttonType) {
  const form = document.createElement("form");
  const button = document.createElement("button");
  button.type = buttonType;
  const input = document.createElement("input");
  input.type = buttonType;
  form.appendChild(button);
  form.appendChild(input);
  return {form, input, button};
}

//form
//  button[type=reset]
export function formButtonReset() {
  const {form, button} = makeFormBranch("reset");
  const usecase = [button, form];
  Object.freeze(usecase);
  return usecase;
}

//form
//  input[type=reset]
export function formInputReset() {
  const {form, input} = makeFormBranch("reset");
  const usecase = [input, form];
  Object.freeze(usecase);
  return usecase;
}

//form
//  button[type=submit]
export function formButtonSubmit() {
  const {form, button} = makeFormBranch("submit");
  const usecase = [button, form];
  Object.freeze(usecase);
  return usecase;
}

//form
//  input[type=submit]
export function formInputSubmit() {
  const {form, input} = makeFormBranch("submit");
  const usecase = [input, form];
  Object.freeze(usecase);
  return usecase;
}