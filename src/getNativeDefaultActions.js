
//this is possible to speed up later, but is really beneficial for debugging, testing and pedagogical purposes
//by not adding these properties immediately, we get a richer map that is simpler to understand
//why different default actions are sorted out or not.
//this pedagogy is actually hugely important..

import {nativeDefaultActions} from "./ListOfNativeDefaultActions.js";

//Event: click[isTrusted]
//                                  div, shadowRoot1, web-comp, div, slot, shadow2, my-href, div, body, html, document, window3
//           {h1,#1,Y}                1     1              3      3     2       2       3       3    3     3      3        3
//                                    n      n             Y      n     n       n       n       n    n     n      n
//
//                                          p
//                                          r
//                              e           e
//                              l   t   r   v   a
//                          e   e   a   e   e   c
//                          v   m   r   p   n   t
//                          e   e   g   e   t   i
//                          n   n   e   a   e   v
//                          t   t   t   t   d   e
// =============================================================================
// 1.scroll               | - | - | v | v | v | -
// 2.ahref_auxclick       | - | - | v | v | v | -
// 3.keydown_enter_input  | - | - | v | v | v | -
// 4.draggable            | - | - | v | v | v | -
// 5.contextmenu          | - | v | v | v | v | -
// 6.dblclick             | v | v | v | v | v | v
//      ...               |   |   |   |   |   |

function matchEventEvent(event, matcher) {
  for (let key in matcher) {
    if (matcher[key] !== event[key])
      return false;
  }
  return true;
}

// What is a valid repeat?
//   a) if the DA.repeat === "all", then this default action can always be activated if the other properties of the DA matches the eventTarget and the event.
//   b) if the DA.repeat === "document", then this default action can always be activated if the same default action has not already been activated in the same document scope. This fits with the usecase of focus. You would always want to repeat focus if it fits the other criteria *once* in each document scope. Most likely, repeat = "document" is combined with targetOnly = true.
//   c) if the DA.repeat === "once", then this default action will be activated once per event, on the first element that all the other criteria fits. This means that if the same default action has not already been activated on another element in the event path, then it will be activated as soon as all other criteria fits.
//   d) if the DA.repeat === "lowestWins", then the default action will only be activated if no other DA with .repeat=== "lowestWins" has already been activated. The "lowestWins" is essentially the same as "once", except that it also stretches beyond different default action types.
function noRepeatConflict(da, activeDAs) {
  if (da.repeat === "all")
    return true;
  if (da.repeat === "document")
    return !activeDAs.find(prevDA => prevDA.defaultAction === da.defaultAction && prevDA.context === da.context);
  if (da.repeat === "lowestWins")
    return !activeDAs.find(prevDA => prevDA.repeat === "lowestWins");
  if (da.repeat === "once")
    return !activeDAs.find(prevDA => prevDA.defaultAction === da.defaultAction);
  throw new Error("Invalid repeat value: " + da.repeat);
}

function getConstructorDefaultActions(constructor){
  const res = constructor.defaultActions || [];
  const proto = constructor.prototype;
  if(proto instanceof HTMLElement)
    return res.concat(getConstructorDefaultActions(Object.getPrototypeOf(proto)));
  return res;
}

function getDefaultActionsTargetType(constructor) {
  const nativeDAs = nativeDefaultActions.filter(da => constructor === da.element || constructor.prototype instanceof da.element);
  const customDAs = getConstructorDefaultActions(constructor);
  return nativeDAs.concat(customDAs);
}

function getDefaultActionsTarget(el) {
  const elDynamic = targetToDA.get(el) || [];
  const context = el.getRootNode();
  let documentDynamic = [];
  if (context !== el && context instanceof DocumentFragment)
    documentDynamic = targetToDA.get(context) || [];
  const das = elDynamic.concat(documentDynamic).concat(getDefaultActionsTargetType(el.constructor));
  // return getDefaultActionsTargetType(el.prototype);//todo here we need to pass in the el prototype constructor??
  return das.map(da => Object.assign({elementInstance: el, context: context}, da));
}

function getDefaultActionsEvent(e) {
  const path = e.composedPath();
  let res = [];
  for (let i = 0; i < path.length; i++) {
    const element = path[i];
    const das = getDefaultActionsTarget(element);
    for (const da of das) {
      da.eventInstance = e;
      da.prevented = e.defaultPrevented; //todo here we can make a narrow default prevented
      da.index = i;

      //todo we cache the tests for validity as OKprops on the DA obj directly
      da.OKevent = matchEventEvent(da.eventInstance, da.event); //todo for speedup, we can simply skip checking the tests when we get a false reponse //that would mean that the active === OKfilter. But this is not good for pedagogy. So we keep the following structure.
      da.OKprevent = !da.defaultPrevented || !da.preventable;
      da.OKrepeat = noRepeatConflict(da, res.filter(da => da.active));
      da.OKfilter = !da.elementFilter || da.elementFilter(da.eventInstance, da.elementInstance);
      da.active = da.OKevent && da.OKfilter && da.OKprevent && da.OKrepeat;
      res.push(da);
    }
  }
  return res;
}

export function getDefaultActions(arg) {
  if (arg instanceof Event)
    return getDefaultActionsEvent(arg);
  if (arg instanceof EventTarget)
    return getDefaultActionsTarget(arg);
  if (arg.prototype instanceof EventTarget )
    return getDefaultActionsTargetType(arg);
  throw new Error("getDefaultActions(arg) only accepts an event with a composedPath() value, an eventTarget, or an EventTargetType.");
}

const targetToDA = new WeakMap();

export function addDefaultAction(target, DA) {
  //todo when we register a dynamic default action, we also have to add a postPropagationCallback that starts the process of default action process. per type.
  //todo this would not work well if the default action has repeat all or repeat document under a document node.
  const list = targetToDA.get(target);
  list ? list.push(DA) : targetToDA.set(target, [DA]);
}

export function removeDefaultAction(target, DA) {
  const list = targetToDA.get(target);
  if (!list)
    return;
  const index = list.indexOf(DA);
  if (index === -1)
    return;
  list.splice(index, 1);
}

//                 6.scroll /|x|/|
//       5.ahref_auxclick /|x|/|x|
//4.keydown_enter_input /|x|/|x|/|
//        3.draggable /|x|/|x|/|x|
//    2.contextmenu /|x|/|x|/|x|/|
//     1.dblclick /|x|/|x|/|x|/|x|
//      eventOK? |x|/|x|/|x|/|x|/|
//               |/|x|/|x|/|x|/|x|
//     elementOK?|x|/|x|/|x|/|x|/|
//               |/|x|/|x|/|x|/|x|
//      filterOK?|x|/|x|/|x|/|x|/|
//               |/|x|/|x|/|x|/|0|
//      targetOK?|x|/|x|/|x|/|0|/
//               |/|x|/|x|/|0|/
//      repeatOK?|x|/|x|/|x|/
//               |/|x|/|0|/
//   preventedOK?|x|/|0|/
//               |/|0|/
//      activeOK?|x|/
//               |/

