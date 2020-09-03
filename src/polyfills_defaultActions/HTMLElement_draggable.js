//dragover/dragenter/dragleave/drop has the mousemoveTarget as their target.
//dragstart/drag/dragend has the mousedownTarget as their target.

// import {addPostPropagationCallback} from "../postPropagationCallback";

const lastOptions = {last: true, unstoppable: true};
const grabOptions = {first: true, capture: true, unstoppable: true};

let triggerDown;
let triggerDownTarget;

let lastMousemove;
let lastMousemoveTarget;

let lastDragover;
let lastDragoverTarget;

let intervallID;

function dispatchDragEvents() {
  //1. dragleave. If there is a change, and there was a previous dragover target.
  //   the target is the last element that was dragover, the body of the event is the mousemove
  //todo verify that the dragleave gets the latest event data
  if (lastDragoverTarget && lastDragoverTarget !== lastMousemoveTarget)
    lastDragoverTarget.dispatchEvent(new DragEvent("dragleave", lastMousemove));
  //2. dragenter. If a new drop target is hit, then dispatch an alert about that.
  //   the target is the last element that was dragover, the body of the event is the mousemove
  if (lastDragoverTarget !== lastMousemoveTarget)
    lastMousemoveTarget.dispatchEvent(new DragEvent("dragenter", lastMousemove));
  //3. dragover. the target is the possible droptarget
  lastDragover = new DragEvent("dragover", lastMousemove);
  lastDragoverTarget = lastMousemoveTarget;
  lastMousemoveTarget.dispatchEvent(lastDragoverTarget);
  //4. drag. the target is the element being dragged.
  triggerDownTarget.dispatchEvent(new DragEvent("drag", lastMousemove));
}

// cache the mousemove and mouseup and mousedown?? events
function grabMousemove(e) {
  if (e.isTrusted !== true)
    return;
  e.preventDefault();
  stopImmediatePropagationOG.call(e);
  lastMousemove = e;
  lastMousemoveTarget = e.target;
}

function grabMouseup(e) {
  if (e.isTrusted !== true || e.button !== 0)
    return;
  e.preventDefault();
  stopImmediatePropagationOG.call(e);
  window.removeEventListener("mousemove", grabMousemove, grabOptions);
  window.removeEventListener("mouseup", grabMouseup, grabOptions);
  clearInterval(intervallID);

  //dispatch the dragend
  triggerDown.dispatchEvent(new DragEvent("drag-end", e));
  //dispatch the drop, if the last dragover is .defaultPrevented  // ugly..//the target has a drop attribute would be better.
  if (lastDragover.defaultPrevented)
    e.target.dispatchEvent(new DragEvent("drop", e));
}

// 1. observe mousemove and see when it has moved more than 5px in total distance x/y since the mousedown
function oneObserveMousemove(e) {
  if (e.isTrusted !== true)
    return;
  if (e.defaultPrevented) { //mousemove.preventDefault() during the initial observation will end the drag.
    window.removeEventListener("mousemove", oneObserveMousemove, lastOptions);
    window.removeEventListener("mouseup", oneObserveMouseup, lastOptions);
  }
  if (Math.abs(e.x - triggerDown.x) + Math.abs(e.y - triggerDown.y) < 5)
    return;
  window.removeEventListener("mousemove", oneObserveMousemove, lastOptions);
  window.removeEventListener("mouseup", oneObserveMouseup, lastOptions);

  window.addEventListener("mousemove", grabMousemove, grabOptions);
  window.addEventListener("mouseup", grabMouseup, grabOptions);

  //dispatch the drag-start event
  triggerDownTarget.dispatchEvent(new DragEvent("dragstart", triggerDown));
  lastMousemoveTarget = e.target;
  lastMousemove = e;
  dispatchDragEvents();
  intervallID = setInterval(dispatchDragEvents, 150); //todo this is fluid i think, depending on how many changes there are.
}


function oneObserveMouseup(e) {
  if (e.isTrusted !== true || e.button !== 0)
    return;
  window.removeEventListener("mousemove", oneObserveMousemove, lastOptions);
  window.removeEventListener("mouseup", oneObserveMouseup, lastOptions);
}

export const draggableDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  stateFilter: function filterDraggableTrue(event, el) {
    if (
      el.getAttribute("draggable") === "true" ||
      el.getAttribute("draggable") !== "false" && (el instanceof HTMLAnchorElement || el instanceof HTMLImageElement)
    )
      return true;
    // const computedStyleDisplay = getComputedStyle(element).display;
    // if (computedStyleDisplay !== "block" || computedStyleDisplay !== "inline-block")
    //   return false;
    return false;
  },
  defaultAction: function observe_dragstart(event, element) {
    triggerDown = event;
    triggerDownTarget = event.target;
    window.addEventListener("mousemove", oneObserveMousemove, lastOptions);
    window.addEventListener("mouseup", oneObserveMouseup, lastOptions);
    //this is essentially a postPropagationCallback. But, we simplify it since we know that
    //both mousemove and mouseup are composed and bubble, so we can add it directly as a last listener on the window.
    // addPostPropagationCallback(window, "mousemove", oneObserveMousemove); //We are
    // addPostPropagationCallback(window, "mouseup", oneObserveMouseup);
  },
  repeat: "lowestWins",
  preventable: true
};