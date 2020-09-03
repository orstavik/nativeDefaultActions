
export const draggableDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  stateFilter: function filterDraggableTrue(event, element){
    if(!element.getAttribute("draggable", "true"))
      return false;
    const computedStyleDisplay = getComputedStyle(element).display;
    if(computedStyleDisplay !== "block" || computedStyleDisplay !== "inline-block")
      return false;
    return true;
  },
  defaultAction: function click_dispatch(event, element) {
    //todo
    // 1. observe mousemove and see when it has moved more than 5px in total distance x/y since the mousedown
    // 2. then grab the mousemove and mouseup and mousedown?? events
    // 3. cache the result from the mousemove and mousedown to keep track of targets
    // 4. setInterval(..., 150ms)
    // 5. in each interval dispatch different events.
    // 6. look out for the preventDefault() on the last dragover/dragenter event, this will cause the drop event.
    dispatchMouseEvent(event, "click", element);
  },
  repeat: "lowestWins",
  preventable: true
};