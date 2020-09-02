// [
//   {
//     element,
//     document,
//     isTarget,
//     repeat,
//     defaultActions[],
//     eventOK[],
//     elementOK[],
//     filterOK[],
//     preventedOK[],
//     activeOK[]
//   }, {
//     ...
//   }
// ]


//this is possible to speed up later, but is really beneficial for debugging, testing and pedagogical purposes
//by not adding these properties immediately, we get a richer map that is simpler to understand
//why different default actions are sorted out or not.
//this pedagogy is actually hugely important..

import {nativeDefaultActions} from "../ListOfNativeDefaultActions3.js";
import {contexts, targets} from "../pureFunctions.js";

//this returns just a global list for now, but this can be fixed in the future
function documentDefaultActions(element, document) {
  const elementDefaultActions = element.prototype.constructor.defaultActions;
  // const documentDefaultActions = document.defaultActions;
  return !elementDefaultActions ? nativeDefaultActions : nativeDefaultActions.concat(elementDefaultActions);
}

export function matchEventEvent(event, matcher) {
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
function noRepeatConflict(da, previousResults, document) {
  if (da.repeat === "all")
    return true;
  for (let previousEntry of previousResults) {
    if (da.repeat !== "document" && previousEntry.document !== document) //if the da.repeat is "document" and the previous entry is on another document, then we don't check. This means that lowestWins will not block "document" repeats. This fits with the focus usecase.
      continue;
    for (let i = 0; i < previousEntry.das.length; i++) {
      let previousDA = previousEntry.das[i];
      if (previousDA !== da && da.repeat !== "lowestWins")
        continue;
      let isActive = previousEntry.active[i];
      //if a previous entry was active, then we know this is false, otherwise we must continue to check.
      if (!isActive)
        return false;
    }
  }
  //we have test all previous entries, and none isActivate in a way that would block this DA
  return true;
}

//previousResults is an array of the result objects coming out of this function
function filterDefaultActions(das, event, element, document, isTarget, previousResults) {
  //1. match event against das.event
  const eventOK = das.map(da => matchEventEvent(event, da.event));
  //2. match element against das.element
  const elementOK = das.map(da => element instanceof da.element);
  //3. match all a) targetOnly da, and b) targetOnly da for isTarget elements
  const targetOK = das.map(da => !(da.targetOnly && !isTarget));
  //4. match repeat
  const repeatOK = das.map(da => noRepeatConflict(da, previousResults, document));
  //5. match das.stateFilter (either no stateFilter or stateFilter returns true for this element
  const filterOK = das.map(da => !da.stateFilter || da.stateFilter(element));
  //6. prevented
  const preventedOK = das.map(da => !event.defaultPrevented || !da.preventable);
  //7. flag as active (if all other flags are active, the DA is active.)
  const activeOK = das.map((da, i) => eventOK[i] && elementOK[i] && filterOK[i] && targetOK[i] && repeatOK[i]);
  return {eventOK, elementOK, filterOK, targetOK, repeatOK, preventedOK, activeOK};
}

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


export function getDefaultActionsFull(e) {
  const path = e.composedPath();
  //todo there is a question about when the document context should be interpreted?? Is it at the end, ie. from the DOM position?? or is it at the beginning, ie. from the propagationPath is decided?? This becomes a problem when elements are adopted from one document to another AND different documents can have different definitions of the element AND these different definitions carry different default actions.
  //todo it feels right to do this based on the elements position when the path is computed (ie. before propagation), but
  //todo it could equally well be done after propagation.
  //todo some default actions should stick to the element. Some default actions should stick to the document. default actions such as dblclick and other event controllers should really stick with the document. While aHrefClickNavigate etc. should stick to the element.
  const contexts = contexts(path);
  const targets = targets(path, contexts);
  const res = [];
  for (let i = 0; i < path.length; i++) {
    let target = path[i], document = contexts[i], isTarget = targets[i];
    const das = documentDefaultActions(target, document);
    let entry = filterDefaultActions(das, e, target, document, isTarget, res);
    entry.event = e;
    entry.element = target;
    entry.document = document;

    entry.isTarget = isTarget;
    entry.das = das;
    res.push(entry);
  }
  return res;
}

export function getDefaultActions(e) {
  const all = getDefaultActionsFull(e);
  const res = [];
  for (let entry of all) {
    for (let i = 0; i < entry.das.length; i++) {
      if (entry.activeOK[i])
        res.push({element: entry.element, defaultAction: entry.das[i], event: e});
    }
  }
  return res;
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
