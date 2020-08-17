import {lastPropagationTarget, shadowElements} from "./pureFunctions.js";
import {getNativeDefaultActions, markExcludedActions} from "./getNativeDefaultActions.js";

const defaultActions = new WeakMap();
const narrowPreventDefaults = new WeakMap();

export function initEvent(event) {
  defaultActions.set(event, []);
  narrowPreventDefaults.set(event, new Set());
}

export function resetEvent(event) {
  defaultActions.delete(event);
  narrowPreventDefaults.delete(event);
}

export function prepareDefaultActions(e) {
  //1. check for the native preventDefault() bomb
  if (e.defaultPrevented === true)
    return [];
  const allDefaultActions = getDefaultActions(e);
  //2. check for narrow preventDefault() on native elements, and if one such is active, then call the native preventDefault() to bomb everything native.
  //   this could be updated in the future to allow developers to narrowly call preventDefault() on only some native default actions, and not others.
  //   but for now, calling narrowPreventDefault() on one native element that actually has a reversible defaultAction triggers the preventDefault on all native default actions.
  if (allDefaultActions.find(defAct => defAct.native && !defAct.excluded && defAct.prevented))
    e.preventDefault();
  return allDefaultActions.filter(defAct => !defAct.native && !defAct.prevented && !defAct.excluded).map(({task}) => task);
}

function runDefaultActions(e, async) {
  const tasks = prepareDefaultActions(e);
  resetEvent(e);
  if (async)
    nextMesoTicks(tasks);
  else {
    for (let task of tasks)
      task();
  }
}

function patchCustomDefaultAction(event) {
  if (defaultActions.has(event))//already set up.
    return;
  initEvent(event);
  //patch the post propagation callback for processing the default action
  const lastNode = lastPropagationTarget(event);
  let async = false;
  Promise.resolve().then(() => async = true);
  lastNode.addEventListener(event.type, e => runDefaultActions(e, async), {unstoppable: true, last: true, once: true});
}

export function addDefault(event, task, host, options = {additive: false, irreversible: false}) {
  if (!(event instanceof Event))
    throw new Error("A defaultAction task is always associated with an event object.");
  if (!(task instanceof Function))
    throw new Error("A defaultAction task must be a (bound) function.");
  if (!host)
    throw new Error("You must associate a host element with the defaultAction task. This host element is usually the host node of a web component.");
  patchCustomDefaultAction(event);
  defaultActions.get(event).push(Object.assign({}, options, {task, host, index: event.composedPath().indexOf(host)}));
}

/**
 * Also works recursively into the shadowDOM of the element which is narrowly preventDefaulted.
 *
 * @param event
 * @param host
 */
export function narrowPreventDefault(event, host) {
  if (!(event instanceof Event))
    throw new Error("A narrowPreventDefault is always associated with an event object.");
  if (!host)
    throw new Error("The narrowPreventDefault targets an event target host. The host element is usually the host node of a web component.");
  if(event.defaultPrevented)
    return; //no need anymore, everything has already been prevented.
  patchCustomDefaultAction(event);
  const narrowPreventeds = narrowPreventDefaults.get(event);
  narrowPreventeds.add(host);
  for (let shadowElement of shadowElements(host, event.composedPath()))
    narrowPreventeds.add(shadowElement);
}

export function getDefaultActions(event) {
  //1. merge the native and the custom default actions, native wins
  const defActs = getNativeDefaultActions(event).concat(defaultActions.get(event) || []);
  //2. sort in order of the propagation path, lowest wins
  defActs.sort((a, b) => a.index <= b.index);
  //3a. mark regular preventDefault()
  if (event.defaultPrevented === true)
    defActs.forEach(defAct => !defAct.irreversible && (defAct.prevented = true));
  //3b. mark narrow preventDefaults
  else {
    for (let narrowPrevented of narrowPreventDefaults.get(event) || []) {
      for (let defAct of defActs) {
        if (defAct.host === narrowPrevented && !defAct.prevented && !defAct.irreversible)
          defAct.prevented = true;
      }
    }
  }
  //4. mark excluded defActs
  markExcludedActions(defActs);
  return defActs;
}