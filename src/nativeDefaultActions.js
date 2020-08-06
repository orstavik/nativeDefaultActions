
//todo
// 1. we are lacking the support for regex in the event property query.
//    This is important when we work with keydown default actions.
//    ivar
// 2. we need to complete the full list of default actions.
//    a. write up the default actions, and be careful not to add event controller default actions, such as contextmenu.
//       examples of event controller default actions are contextmenu and keypress-to-click
//       write a list of both the default actions that come from event controllers and elements here.
// 3. add more and check the list of all exposed requestDefaultAction methods.. we use modern chrome behavior as guide.


//generic default actions
//1. contextmenu, "*".
//2. drag'n'drop, "[draggable]". add more to the queryselector here, not everything marked [draggable] can be dragged?? We also need a queryselector format that queries for css properties..
//3. keydown enter produces click. I think this should be "a[href], input, button, textarea, select"?? is it the same as focusable?? no there are special rules here..
//4. the deadcaps controller. this is a mess.. produces composition events and beforeinput (except in old firefox).
//   deadcaps are currently actually handled by input and textarea..

import {listOfDefaultActions} from "./ListOfNativeDefaultActions.js";

function makeEventFilter(eventQuery) {
  const question = eventQuery.indexOf("?");
  const type = question >= 0 ? eventQuery.substr(0, question) : eventQuery;
  let props = question >= 0 ? eventQuery.substr(question + 1) : [];
  if (!(props instanceof Array))
    props = props.split("&").map(query => query.split("="));
  return function (e) {
    if (e.type !== type)
      return false;
    for (let [prop, value] of props) {
      if (e[prop]+"" !== value)
        return false;
    }
    return true;
  };
}

function makeDirectChildFilter(matchers) {
  return function matchParentChild(e) {
    const targets = e.composedPath();                     //this implies access to closed shadowRoots
    targetLoop: for (let i = 0; i < targets.length; i++) {
      let j = 0;
      for (; j < matchers.length; j++) {
        let matcher = matchers[j];
        const checkTarget = targets[i + j];
        if (!(checkTarget instanceof HTMLElement) || !checkTarget.matches(matcher))
          continue targetLoop;
      }
      j--;
      return [i, targets[i + j], targets[i]];
    }
    return [];
  };
}

function makeDescendantChildFilter(matchers) {
  const [child, parent] = matchers;
  return function matchParentDescendant(e) {
    const targets = e.composedPath();                     //this implies access to closed shadowRoots
    targetLoop: for (let i = 0; i < targets.length; i++) {
      const childTarget = targets[i];
      if (!(childTarget instanceof HTMLElement) || !childTarget.matches(child))
        continue;
      for (let j = i + 1; j < targets.length; j++) {
        const parentTarget = targets[j];
        if (!(parentTarget instanceof HTMLElement))
          continue targetLoop;
        if (parentTarget.matches(parent))
          return [i, parentTarget, childTarget];
      }
    }
    return [];
  };
}

function makeSingularFilter(matcher) {
  return function matchElement(e) {
    const targets = e.composedPath();                     //this implies access to closed shadowRoots
    for (let i = 0; i < targets.length; i++) {
      const checkTarget = targets[i];
      if (checkTarget instanceof HTMLElement && checkTarget.matches(matcher))
        return [i, targets[i], undefined];
    }
    return [];
  };
}

function makeElementFilter(query) {
  let matchers = query.split(">");
  if (matchers.length > 1)
    return makeDirectChildFilter(matchers.reverse());
  matchers = query.split(" ");
  if (matchers.length === 2)
    return makeDescendantChildFilter(matchers.reverse());
  if (matchers.length === 1)
    return makeSingularFilter(query);
  throw new SyntaxError("element filter syntax error");
}

let listOfDefaultActions2 = [];
for (let {eventQuery, elementQuery, method, additive} of listOfDefaultActions) {
  for (let elementQuery1 of elementQuery.split(",")) {
    listOfDefaultActions2.push({
      eventQuery: makeEventFilter(eventQuery),
      elementQuery: makeElementFilter(elementQuery1.trim()),
      method,
      additive
    });
  }
}

export function nativeDefaultActions(e) {
  return listOfDefaultActions2
    .filter(({eventQuery}) => eventQuery(e))
    .reduce((acc, defAct) => {
      const [childIndex, parent, child] = defAct.elementQuery(e);
      if (parent) {
        acc.push({
          index: childIndex,
          element: parent,
          task: defAct.method(parent, child, e),
          native: true,
          additive: defAct.additive
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.index < b.index);
}