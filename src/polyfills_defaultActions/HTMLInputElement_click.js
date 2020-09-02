function clickCheckbox(event, element){
  //todo
}

function clickRadio(event, element){
  //todo
}

export const clickInputDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "click"
    //isTrusted is irrelevant, todo verify and make test
  },
  elementFilter: function (el) {
    return (
      el.type === "checkbox" ||
      el.type === "radio" ||
      el.type === "color" ||
      (el.form && (
        el.type === "submit" ||
        el.type === "reset")
      )
    );
  },
  defaultAction: function inputClick(event, el) {
    if (el.type === "checkbox")
      return clickCheckbox(event, el);
    if (el.type === "radio")
      return clickRadio(event, el);
    if (el.type === "submit")
      return el.form.requestSubmit(el);
    if (el.type === "reset")
      return el.form.reset();
    // if(el.type === "color") //
    //   return makeAColorPalette(event, element);

    //Problem.
    //  click on a control element inside the native shadowDOM of the input element
    //  cannot be distinguished from a click on the body of the element.
    //  If we could inspect the inner shadowDOM of these native input elements,
    //  we could assess whether or not
  },
  repeat: "lowestWins",
  preventable: true
};