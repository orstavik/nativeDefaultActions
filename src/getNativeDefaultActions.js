/**
 * This set of pure functions turns the list of native default actions into a query engine that can
 * extract active default actions from any event (with a composedPath()).
 *
 * The method primarily translates the custom format for eventQuery and elementQuery into callable JS functions.
 */
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

/**
 * Gets the list of all native default actions that are associated with an event instance.
 * @param e
 * @returns {[]}
 */
export function getNativeDefaultActions(e) {
  const defActs = listOfDefaultActions2.filter(({eventQuery}) => eventQuery(e));
  const res = [];
  for (let defAct of defActs) {
    const [childIndex, parent, child] = defAct.elementQuery(e);
    if (parent) {
      res.push({
        //todo the FORM default action uses the child index, but the details and option/select uses the parent. I think.
        index: childIndex,
        host: parent,
        task: defAct.method(parent, child, e),
        native: true,
        additive: !!defAct.additive,
        irreversible: !!defAct.irreversible,
        eventQueryStr: defAct.eventQueryStr,
        elementQueryStr: defAct.elementQueryStr
      });
    }
  }
  return res;
}

//att! mutates the input object.
export function markExcludedActions(actions) {
  let firstExclusive;
  for (let defAct of actions) {
    if (defAct.additive)
      continue;
    if (!firstExclusive)
      firstExclusive = defAct;
    else
      defAct.excluded = true;
  }
  return actions;
}

export function getDefaultActions(e) {
  let nativeDefaultActions = getNativeDefaultActions(e);
  if (e.defaultPrevented)
    nativeDefaultActions.forEach(defAct => defAct.prevented = true);
  nativeDefaultActions = markExcludedActions(nativeDefaultActions);
  return nativeDefaultActions.sort((a, b) => a.index <= b.index);
}