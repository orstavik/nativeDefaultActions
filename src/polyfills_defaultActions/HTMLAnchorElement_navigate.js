export const clickNavigateDefaultAction = {
  element: HTMLAnchorElement,
  event: {
    type: "click",
    isTrusted: true
  },
  elementFilter: function navigate_filter(element) {
    return element.hasAttribute("href");
  },
  defaultAction: function navigate(event, element) {
    document.open(element.href);
  },
  repeat: "lowestWins",
  preventable: true,
  targetOnly: false
};

export const auxclickNavigateDefaultAction = {
  element: HTMLAnchorElement,
  event: {
    type: "auxclick",
    isTrusted: true,
    button: 1
  },
  elementFilter: function navigate_filter(element) {
    return element.hasAttribute("href");
  },
  defaultAction: function navigate_blank(event, element) {
    document.open(element.href, "_BLANK");
  },
  repeat: "once",   //TODO BUG in browsers!!! should be TRUE. Report this bug in FF and add the number here
  preventable: true,
  targetOnly: false,

};

export const enterToClickDefaultAction = {
  element: HTMLAnchorElement,  //todo should this action be on HTMLElement instead?? or implement as a querySelector??
  event: {
    type: "keydown",
    isTrusted: true,
    key: "Enter"
  },
  elementFilter: function navigate_filter(element) {
    return element.hasAttribute("href") /* && el.matches(":focus-within")*/; //its redundant to check for focus, right?
  },
  defaultAction: function enter_click(event, element) {
    const click = new MouseEvent("click", {composed: true, bubbles: true});
    click.async = event.async;
    click.isTrusted = true;
    //todo which other properties from the event needs to be transferred??
    element.dispatchEvent(click);
  },
  repeat: "lowestWins",
  preventable: true,
  targetOnly: false,

};