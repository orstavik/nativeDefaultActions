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
      if (e[prop] + "" !== value)
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
for (let {eventQuery, elementQuery, method, additive, irreversible} of listOfDefaultActions) {
  for (let elementQuery1 of elementQuery.split(",")) {
    listOfDefaultActions2.push({
      eventQueryStr: eventQuery,
      elementQueryStr: elementQuery,
      eventQuery: makeEventFilter(eventQuery),
      elementQuery: makeElementFilter(elementQuery1.trim()),
      method,
      additive,
      irreversible
    });
  }
}

export function getDefaultActions(e) {
  return listOfDefaultActions2
    .filter(({eventQuery}) => eventQuery(e))
    .reduce((acc, defAct) => {
      const [childIndex, parent, child] = defAct.elementQuery(e);
      if (parent) {
        acc.push({
          index: childIndex,//todo the FORM default action uses the child index, but the details and option/select uses the parent. I think.
          host: parent,
          task: defAct.method(parent, child, e),
          native: true,
          additive: !!defAct.additive,
          irreversible: !!defAct.irreversible,
          eventQueryStr: defAct.eventQueryStr,
          elementQueryStr: defAct.elementQueryStr
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.index <= b.index);
}