import {lastPropagationTarget, shadowElements} from "../pureFunctions.js";
import {matchEventEvent} from "../getNativeDefaultActions3.js";
import {addPostPropagationCallback} from "../postPropagationCallback";

const defaultActionsRegistered = new WeakMap();

function prepDefaultActions(e) {
  const defaultActions1 = getDefaultActions(e);
  const callbackListeners = defaultActionsRegistered.get(e);
  let surplusListenerCount = callbackListeners.length - defaultActions1.length;
  for (let i = 0; i < surplusListenerCount; i++) {
    const callbackInstance = callbackListeners.pop();
    this.removeEventListener(e.type, callbackInstance, {last: true, once: true, unstoppable: true});
  }
  defaultActionsRegistered.set(e, defaultActions1);
}

function doOneDefaultAction(e) {
  const remainings = defaultActionsRegistered.get(e);
  const da = remainings.pop();
  if (!remainings.length)              //clean up if the event is reused and dispatched twice.
    defaultActionsRegistered.delete(e);
  da.defaultAction(da.element, e);
}

//This assumes the default action is not added to the event when it has already propagated to the lastPropagationNode and AT_TARGET phase.
//We can't then add event listeners dynamically, so we must use nextTick.
// and, an extra twist. For capturePhase host nodes that have a closedMode
//if adding another event listener dynamically will work. If we can't do that, then we do a nextTick?? I think that is a good plan.
//d. so the postPropagationCallback is either a nextTick, or an addEventListener. This might need to be fixed.. It is not that super simple..
//e. so, we add the default action
function postProcessDefaultActions(e, possibleDA) {
  const lastPropagationTarget = lastPropagationTarget(e);
  //if(e.currentTarget === lastPropagationTarget && e.eventPhase !== Event.CAPTURING_PHASE)
  //  is currently at lastPropagationTarget. then we must use nextTick()
  //twist. This might happen to eventListeners added 
  let previousCallbacks = defaultActions.get(e);
  if (!previousCallbacks) {
    lastPropagationTarget.addEventListener(e.type, prepDefaultActions, {last: true, once: true, unstoppable: true});
    defaultActions.set(e, previousCallbacks = []);
  }
  for (let i = 0; i < possibleDA.length; i++) {
    const callbackInstance = e => doOneDefaultAction(e);
    previousCallbacks.push(callbackInstance);
    lastPropagationTarget.addEventListener(e.type, callbackInstance, {last: true, once: true, unstoppable: true});
  }
}

function patchDefaultAction(e) {
  const defaultActions = this.prototype.constructor.defaultActions;
  const relevantDAs = defaultActions.filter(DA => matchEventEvent(e, DA.event));
  relevantDAs.length && postProcessDefaultActions(e, relevantDAs);
}

function prepareDefaultActions(e){

}

const preparedDefaultActions = new WeakMap();

function processDefaultActions(e) {
  let prepped = preparedDefaultActions.get(e);
  if (!prepped)
    preparedDefaultActions.set(e, prepped = prepareDefaultActions(e));
  if (prepped.length) {
    const DA = prepped.pop();
    DA.defaultAction(e, DA.target);
  } else{
    //stopImmediatePropagationOG.call(e);
    //preparedDefaultActions.delete(e);
  }
}

function DefaultActionMixin(Base) {
  return class extends Base {
    constructor() {
      super();
      const defaultActions = this.prototype.constructor.defaultActions;
      const types = defaultActions.map(DA => DA.event.type);
      for (let type of types)
        addPostPropagationCallback(this, type, function (e) {
          processDefaultActions(e);
        });
    }
  };
}

customElements.define("tag-name", WebComp);

function define(name, clazz) {
  if (clazz.defaultActions)
    clazz = DefaultActionMixin(clazz);
  defineOG(name, clazz);
  //we only add the defaultActions to the list when the defineOG is successful and doesn't throw an Error.
  //add clazz.defaultActions to the list of customDefaultActions
}


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
  if (async && tasks.length)
    nextMesoTicks(tasks, 1);//todo fix mesoticks.
  else {
    for (let task of tasks)
      task();//todo if the task throws an error, then the other default actions should still run. That means that we should do the dispatchError logic here..
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
  if (event.defaultPrevented)
    return; //no need anymore, everything has already been prevented.
  patchCustomDefaultAction(event);
  const narrowPreventeds = narrowPreventDefaults.get(event);
  narrowPreventeds.add(host);
  for (let shadowElement of shadowElements(host, event.composedPath()))
    narrowPreventeds.add(shadowElement);
}

export function getDefaultActions(event) {
  //1. merge the native and the custom default actions, native wins
  let defActs = getNativeDefaultActions(event).concat(defaultActions.get(event) || []);
  //2. sort in order of the propagation path, lowest wins
  defActs.sort((a, b) => a.index === b.index ? 0 : a.index < b.index ? -1 : 1)
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