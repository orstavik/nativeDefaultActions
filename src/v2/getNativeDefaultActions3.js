// [
//   {
//     index,
//     host,
//     isTarget,
//     composedContextId,
//     defaultActions: [
//           event,
//           element,
//           stateFilter,
//           defaultAction,
//           preventable,
//           lowestWins,
//           composed,
//           targetOnly]
//   }, {
//     ...
//   }
// ]


//this is possible to speed up later, but is really beneficial for debugging, testing and pedagogical purposes
//by not adding these properties immediately, we get a richer map that is simpler to understand
//why different default actions are sorted out or not.
//this pedagogy is actually hugely important..

import {nativeDefaultActions} from "./ListOfNativeDefaultActions3.js";
import {contexts, targets} from "./pureFunctions.js";

//this returns just a global list for now, but this can be fixed in the future
function documentDefaultActions(document) {
  return nativeDefaultActions;
}

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
  return {
    eventOK,
    elementOK,
    filterOK,
    targetOK,
    repeatOK,
    preventedOK,
    activeOK
  };
}

//Event: click[isTrusted]
//                                  div, shadowRoot1, web-comp, div, slot, shadow2, my-href, div, body, html, document, window3
//           {h1,#1,Y}                1     1              3      3     2       2       3       3    3     3      3        3
//                                    n      n             Y      n     n       n       n       n    n     n      n


//                 6.scroll /|x|/|0|/|0|/|/
//       5.ahref_auxclick /|x|/|0|/|x|/|0/
//4.keydown_enter_input /|0|/|x|/|0|/|x|
//        3.draggable /|0|/|x|/|0|/|x|/
//    2.contextmenu /|0|/|0|/|x|/|0|/
//     1.dblclick /|0|/|0|/|x|/|x|0/
//  ?eventMatch? |x|/|0|/|x|/|0|/|/
//               |/|x|/|0|/|x|/|0/
// ?elementMatch?|x|/|0|/|x|/|0/
//               |/|x|/|0|/|x/
//?stateFilter?|x|/|0|/|x/
//               |/|x|/|0/
//     ?isTarget?|x|/|0/
//               |/|x|/
//  ?validRepeat?|x|/
//               |/
//    ?prevented?|x|/
//               |/
export function getDefaultActions(e) {
  const path = e.composedPath();
  const contexts = contexts(path);
  const targets = targets(path, contexts);
  const res = [];
  for (let i = 0; i < path.length; i++) {
    let target = path[i], document = contexts[i], isTarget = targets[i];
    const das = documentDefaultActions(document);
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


// //mark excluded composed lowestWins
// function excludeLowestWinsLoosers(res) {
//   let lowestComposedTrue;
//   const lowestComposedFalseContexts = [];
//   for (let entry of res) {
//     for (let da of entry.defaultActions) {
//       if (!da.lowestWins)
//         continue;
//       if (lowestComposedTrue || lowestComposedFalseContexts.indexOf(entry.contextID) >= 0)
//         da.lowestWinsExcluded = true;
//       else {
//         if (da.composed === true)
//           lowestComposedTrue = da;
//         else
//           lowestComposedFalseContexts.push(entry.contextID);
//       }
//     }
//   }
// }
//
// //mark targetExcluded
// function excludeNonTargets(res) {
//   for (let entry of res) {
//     for (let da of entry.defaultActions) {
//       if (da.targetOnly)
//         da.targetExcluded = !entry.isTarget;
//     }
//   }
// }
//
// //mark excludedInSameContext
// //if the same da has been added in a different context, then
// function excludeDuplicatesInComposedContexts(res) {
//   const knownDefaultActionsComposedTrueUniqueIDs = [];
//   const knownDefaultActionsComposedFalseUniqueIDs = {};
//   for (let entry of res) {
//     for (let da of entry.defaultActions) {
//       if (da.composed) {
//         if (knownDefaultActionsComposedTrueUniqueIDs.indexOf(da.uniqueID) >= 0) {
//           da.composedExcluded = true;
//         } else {
//           da.composedExcluded = false;
//           knownDefaultActionsComposedTrueUniqueIDs.push(da.uniqueID);
//         }
//       } else {
//         if (knownDefaultActionsComposedFalseUniqueIDs[entry.contextID].indexOf(da.uniqueID) >= 0) {
//           da.composedExcluded = true;
//         } else {
//           da.composedExcluded = false;
//           const list = knownDefaultActionsComposedTrueUniqueIDs[entry.contextID];
//           if (list)
//             list.push(da.uniqueID);
//           else
//             knownDefaultActionsComposedTrueUniqueIDs[entry.contextID] = [da.uniqueID];
//         }
//
//       }
//     }
//   }
// }
//
// export function getNativeDefaultActions(e) {
//   const das = nativeDefaultActions.filter(da => matchEventEvent(e, da.event));
//   const res = flagTargets(composedPathContextIDs(e.composedPath()));
//   for (let entry of res)
//     entry.defaultActions = das.filter(da => matchElementElementFilter(entry.host, da.element, da.stateFilter)).map(da => Object.assign({uniqueID: da}, da));
//
//   e.defaultPrevented && flagPreventedEntries(res);
//   excludeLowestWinsLoosers(res);
//   excludeNonTargets(res);
//   excludeDuplicatesInComposedContexts(res);
//   return res;
// }

/**
 * Add a context ID for each element.
 * The context ID are found using the following algorithm:
 *  1. reverse the composedPath.
 *  2. all context IDs can only be used for one DOM context.
 *  3. start with context ID "A". This marks the main context.
 *  4. every time we pass into a ShadowRoot in the path, a new context ID is selected.
 *     The new context ID is the current context ID with a new character added to its tail.
 *     The IDs represent a trie representation of the context ID graph.
 *  5. Every time the path passes by a slot, the algorithm drops out to the previous context ID
 *     by dropping the last character from the current context ID.
 */
function composedPathContextIDs(path) {
  const res = new Array(path.length);
  let currentID = "A";
  const usedIDs = [currentID];
  for (let i = path.length - 1; i >= 0; i--) {
    const node = path[i];
    if (node instanceof ShadowRoot) {
      let c = 65;
      let nextName = currentID + String.fromCharCode(c++);
      while (usedIDs.indexOf(nextName) !== -1)
        nextName = currentID + String.fromCharCode(c++);
      currentID = nextName;
      usedIDs.push(currentID);
    }
    res[i] = {host: node, index: i, contextID: currentID};
    if (node.tagName === "SLOT")               //todo does this work with fallback nodes??
      currentID = currentID.substr(0, -1);
  }
  return res;
}

//mutates
function flagTargets(richPath) {
  const knownContexts = [];
  for (let rich of richPath) {
    rich.isTarget = false;
    if (knownContexts.indexOf(rich.contextID) === -1) {
      knownContexts.push(rich.contextID);
      if (!(rich.host instanceof HTMLSlotElement))
        rich.isTarget = true;                   //todo does this work with fallback nodes??
    }
  }
  return richPath;
}