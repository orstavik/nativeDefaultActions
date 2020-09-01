import {lastPropagationTarget} from "./pureFunctions.js";

const target_cb_type_oneTwo = new WeakMap();
const event_cbs = new WeakMap();

function runCb(e) {
  const {cb, target} = event_cbs.get(e).pop();
  cb.call(target, e);
}

function getPostPropagationRegister(target, cb, type) {
  return target_cb_type_oneTwo.get(target)?.get(cb)?.get(type);
}

//Cache the target/cb/type to [one two].
//The cache is necessary to check for redundancy and remove the postPropagationCB
function registerPropagationCallback(target, cb, type, one, two) {
  let cb_type_oneTwo = target_cb_type_oneTwo.get(target);
  if (!cb_type_oneTwo)
    target_cb_type_oneTwo.set(target, cb_type_oneTwo = new WeakMap());
  let type_oneTwo = cb_type_oneTwo.get(cb);
  if (!type_oneTwo)
    cb_type_oneTwo.set(target, type_oneTwo = new Map());
  type_oneTwo.set(type, [one, two]);  //we can skip the last test, as this was done in the first step.
}

const options1 = {capture: true, unstoppable: true};
const options2 = {capture: false, last: true, unstoppable: true};
const options3 = {capture: false, last: true, unstoppable: true, once: true};

function makeTwo(target) {
  return function (e) {
    const lastTarget = lastPropagationTarget(e);
    lastTarget === target && runCb.call(target, e);
  };
}

function makeOne(cb, target, type) {
  return function (e) {
    //a. add the cb to the list to be added.
    const cbs = event_cbs.get(e);
    cbs ? cbs.unshift({cb, target}) : event_cbs.set(e, [{cb, target}]);
    //b. add the dynamic listener possible
    const lastTarget = lastPropagationTarget(e);
    if (lastTarget !== target) {
      //if something goes wrong, then this event listener remains.. we need to ensure that it is only active for the current event
      const three = function (e) {
        runCb.call(target, e);
      };
      lastTarget.addEventListener(type, three, options3);
    }
  };
}

export function addPostPropagationCallback(target, type, cb) {
  //1. just exit, if the same combination target, type, cb is already added
  if (getPostPropagationRegister(target, cb, type))
    return;

  //2. make the stateful one two (three) closures
  const one = makeOne(cb, target, type);
  const two = makeTwo(target);
  target.addEventListener(type, one, options1);
  target.addEventListener(type, two, options2);
  registerPropagationCallback(target, cb, type, one, two);
}

export function removePostPropagationCallback(target, type, cb) {
  const [one, two] = target_cb_type_oneTwo.get(target)?.get(cb)?.get(type);
  if (one) {
    target.removeEventListener(type, one, true);
    target.removeEventListener(type, two, false);
  }
}