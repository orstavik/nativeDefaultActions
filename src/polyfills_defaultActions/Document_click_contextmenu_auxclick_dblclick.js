

//Att:   Other native modale pop-ups such as "mousedown on select" and ".alert(...)/.confirm(...)"
//       simply block/grab the mouseevents while active and leaves the rest of the stat of click events untouched.

function makeAsyncMouseEvent(newType, mouseup) {
  const click = new MouseEvent(newType, mouseup);
  click.async = mouseup.async;
  click.isTrusted = true;
  return click;
}

function lowestSharedTarget(pathA, pathB) {
  const ra = pathA.reverse();
  const rb = pathB.reverse();
  if (ra[0] !== rb[0])
    return null;
  let i = 1;
  while (i < ra.length && ra[i] === rb[i])
    i++;
  return ra[i - 1];
}

let mousedownPaths = [];

export const clickMousedownObserver = {
  element: Document,
  event: {
    type: "mousedown",
    isTrusted: true
  },
  defaultAction: function click_mousedown_observer(event, element) {
    mousedownPaths[event.button] = event.composedPath();
  }
};

//drag events interfere with click event?
export const clickDragObserver = {
  element: Document,
  event: {
    type: "dragstart"
  },
  defaultAction: function click_drag_observer(event, element) {
    mousedownPaths = [];
    lastClick = undefined;
  }
};

export const clickDefaultAction = {
  element: Document,
  event: {
    type: "mouseup",
    isTrusted: true,
    button: 0
  },
  stateFilter: function(event, element){
    return !!mousedownPaths[event.button];
  },
  defaultAction: function dispatchClick(event, element) {
    const target = lowestSharedTarget(event.composedPath(), mousedownPaths[event.button]);
    target.dispatchEvent(makeAsyncMouseEvent("click", event));
  }
};

let lastClick;

export const dblclickDefaultAction = {
  element: Document,
  event: {
    type: "click",
    isTrusted: true
  },
  //this must run, because it will update the state of the lastClick of all clicks.
  defaultAction: function maybeDispatchDblclick(click, element) {
    if (lastClick && (click.timeStamp - lastClick.timeStamp) < 300) {
      lastClick = null;
      click.target.dispatchEvent(makeAsyncMouseEvent("dblclick", click));
    } else {
      lastClick = click;
    }
  }
};

let mousedown_contextmenu;

export const contextmenuDefaultAction = {
  element: Document,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 2
  },
  defaultAction: function dispatchContextmenu(mousedown, element) {
    const contextmenu = makeAsyncMouseEvent("contextmenu", mousedown);
    mousedown_contextmenu = [mousedown, contextmenu];
    mousedown.target.dispatchEvent(contextmenu);
  }
};

export const auxclickDefaultAction = {
  element: Document,
  event: {
    type: "mouseup",
    isTrusted: true
  },
  stateFilter: function(event, element){
    if(event.button === 0)
      return false;
    const mousedown = mousedownPaths[event.button];
    if(!mousedown)
      return false;
    if(event.button !== 2)
      return true;
    //Showing the native contextmenu CANCELS the auxclick event after contextmenu event.
    if(!mousedown_contextmenu)
      return true;
    return mousedown !== mousedown_contextmenu[0] || !!mousedown_contextmenu[1].defaultPrevented;
  },
  defaultAction: function dispatchAuxclick(event, element) {
    const target = lowestSharedTarget(event.composedPath(), mousedownPaths[event.button]);
    target.dispatchEvent(makeAsyncMouseEvent("auxclick", event));
  }
};

//altering the position of the mousedown target aborts the click/auxclick in chrome. This is not good, and not included here.
