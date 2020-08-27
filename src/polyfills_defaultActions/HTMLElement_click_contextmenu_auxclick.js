function dispatchMouseEvent(event, type, target) {
  const auxclick = new MouseEvent(type, {composed: true, bubbles: true});
  auxclick.async = event.async;
  auxclick.isTrusted = true;
  auxclick.button = event.button;
  //copy over other event properties from click
  target.dispatchEvent(auxclick);
  return auxclick;
}

//todo assumes that we do not need to observe mousedown or mousemove.
//todo this is wrong, as "select" event will abort mouseup..
//todo tests, what do we need.
//todo we need to select and drag events blocking (aux)click/contextmenu events
//todo do we need to observe the mousedown??
export const clickDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mouseup",
    isTrusted: true,
    button: 0
  },
  defaultAction: function click_dispatch(event, element) {
    dispatchMouseEvent(event, "click", element);
  },
  repeat: "lowestWins",
  preventable: false,
  targetOnly: true,
};

//todo the contextmenu for keydown.key = contextmenuKey doesn't need to be part of this default action.
let lastMouseup, lastContextmenu;

export const contextmenuDefaultAction = {
  element: HTMLElement,
  event: {
    type: "mouseup",
    isTrusted: true,
    button: 2
  },
  defaultAction: function contextmenu_dispatch(event, element) {
    const contextmenu = dispatchMouseEvent(event, "contextmenu", element);
    lastMouseup = event;
    lastContextmenu = contextmenu;
  },
  repeat: "once",
  preventable: false,
  targetOnly: true,
};

export const auxclickDefaultAction2 = {
  element: HTMLElement,
  event: {
    type: "mouseup", // also possible to activate by keyboard event
    isTrusted: true,
    button: 2
  },
  defaultAction: function auxclick_after_contextmenu_dispatch(event, element) {
    if (!lastContextmenu.defaultPrevented)
      return;
    if (event !== lastMouseup)
      throw new Error("omg, this should never happen, why is it happening??");
    dispatchMouseEvent(event, "auxclick", element);
  },
  repeat: "lowestWins",
  preventable: false,
  targetOnly: true,

};

export const auxclickDefaultAction1 = {
  element: HTMLElement,
  event: {
    type: "mouseup",
    isTrusted: true,
    button: 1
  },
  defaultAction: function dispatch_auxclick(event, element) {
    dispatchMouseEvent(event, "auxclick", element);
  },
  repeat: "lowestWins",
  preventable: false,
  targetOnly: true,

};

export const auxclickDefaultAction3 = {
  element: HTMLElement,
  event: {
    type: "mouseup",
    isTrusted: true,
    button: 3
  },
  defaultAction: function dispatch_auxclick_3(event, element) {
    dispatchMouseEvent(event, "auxclick", element);
  },
  repeat: "lowestWins",
  preventable: false,
  targetOnly: true,

};

export const auxclickDefaultAction4 = {
  element: HTMLElement,
  event: {
    type: "mouseup",
    isTrusted: true,
    button: 4
  },
  defaultAction: function dispatch_auxclick_3(event, element) {
    dispatchMouseEvent(event, "auxclick", element);
  },
  repeat: "lowestWins",
  preventable: false,
  targetOnly: true,

};

export const showContextmenuDefaultAction = {
  element: HTMLElement,
  event: {
    type: "contextmenu",
    isTrusted: true
  },
  defaultAction: function display_contextmenu(event, element) {
    alert("poor excuse for a contextmenu: " + element.tagName);
  },
  repeat: "lowestWins",
  preventable: true,
  targetOnly: true,

};
