import {listOfDefaultActions} from "./ListOfNativeDefaultActions2.js";

/**
 * Gets the list of all native default actions that are associated with an event instance.
 * @param e
 * @returns {[]}
 */
export function getNativeDefaultActions(e) {
  const defActs = listOfDefaultActions[e.type];
  let res = [];
  const path = e.composedPath();
  for (let i = 0; i < path.length; i++) {
    let el = path[i];
    //todo the map is really elementType => eventType => defAct.
    //todo it would be faster and simpler to filter the element based on type/summary tag.
    const selectorsAndActions = defActs.filter(function (defAct) {
      return el instanceof defAct.element || defAct.element === 'SUMMARY' && el.tagName === 'SUMMARY';
    });
    const actions = selectorsAndActions.map(function (defAct) {
      if (defAct.defaultAction instanceof Function) {
        const dynamicResult = defAct.defaultAction(e, el);
        if (dynamicResult)
          defAct = Object.assign({}, defAct, dynamicResult);
      }
      //todo we also need to remove the actions that are associated with the element.
      return defAct;
    }).filter(a => !!a).map(defAct => {
      return ({
        index: i,
        host: el,
        task: defAct.defaultAction,
        preventable: defAct.preventable,
        lowestWins: defAct.lowestWins,
        targetOnly: defAct.targetOnly,
        native: true,
        event: e.type,
        element: defAct.element,
      })
    });
    res = res.concat(actions);
  }
  return res;
}

export function getDefaultActions(e) {
  const res = getNativeDefaultActions(e);
  res.filter(a => a.lowestWins).slice(1).forEach(a => a.excluded = true);
  e.defaultPrevented && res.filter(a => a.preventable).forEach(a => a.prevented = true);
  return res;
}