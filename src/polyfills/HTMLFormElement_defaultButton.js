export function defaultButton(form){
  return form.querySelector("input[type=image]:default:not([disabled]), input[type=submit]:default:not([disabled]), button[type=submit]:default:not([disabled])");
}