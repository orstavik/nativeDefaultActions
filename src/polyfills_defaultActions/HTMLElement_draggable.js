function dispatchMouseEvent(event, type, target) {
  const auxclick = new MouseEvent(type, {composed: true, bubbles: true});
  auxclick.async = event.async;
  auxclick.isTrusted = true;
  auxclick.button = event.button;
  //copy over other event properties from click
  target.dispatchEvent(auxclick);
  return auxclick;
}

function recastMouseEvent(mouseevent){

}

export const draggableDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  elementFilter: function filterDraggableTrue(event, element){
    if(!element.getAttribute("draggable", "true"))
      return false;
    const computedStyleDisplay = getComputedStyle(element).display;
  },
  defaultAction: function click_dispatch(event, element) {
    dispatchMouseEvent(event, "click", element);
  },
  repeat: "once", //todo the draggable just observes in the beginning. But, you can't have more than one draggable observing.
  preventable: false
};