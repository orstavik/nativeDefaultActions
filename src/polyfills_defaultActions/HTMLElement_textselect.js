function isTextcontainingInput(el) {
  return el instanceof HTMLInputElement && (
    el.type === "text" ||
    el.type === "email" ||
    el.type === "tel" ||
    el.type === "search" ||
    el.type === "url" ||
    el.type === "password" ||
    el.type === "number" ||
    el.type === "file" ||
    el.type === "date" ||
    el.type === "week" ||
    el.type === "time" ||
    el.type === "month" ||
    el.type === "datetime-local"
  );
}

export const textselectDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  stateFilter: function hasTextNode(ev, el) {
    //1. check for draggable parent
    const composedPath = composedPath(el); //todo add this to pureFunctions.js
    for (let parentNode of composedPath) {
      if(parentNode.getAttribute && parentNode.getAttribute("draggable") === "true")
        return false;
      if(parentNode instanceof HTMLAnchorElement && parentNode.getAttribute("draggable") !== "false")
        return false;
    }
    //2. check for active user-select style
    //todo here there are multiple other scenarios where the textselect default action could be activated
    const userSelect = getComputedStyle(el).userSelect;
    if(userSelect === "none")
      return false;

    //3. check that the element has a relevant textnode.
    const hasText = isTextcontainingInput(el) || el instanceof HTMLTextAreaElement || Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if(!hasText)
      return false;
    return true;
  },
  defaultAction: function dispatchTextSelect(event, element) {
    //todo here we dispatch some events, we listen for mousemoves and capture those, and then we also measure which letters are being copied. This we cannot replicate, as the position of the text vs the position of the mouse cursor is not accessible from js.
  },
  repeat: "lowestWins", //or "once", possibly. But
  //targetOnly: true. This would be greatly beneficial for this default action as it would greatly improve performance.
  preventable: true
};