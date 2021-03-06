import {lastPropagationTarget} from "./pureFunctions.js";
import {} from "./EventListenerOptionsFirstLast.js";

//register of the postPropagation cbs for this particular event.
const event_cbs = new WeakMap();

function registerEventCbTarget(e, cb, target) {
  const cbs = event_cbs.get(e);
  cbs ? cbs.unshift({cb, target}) : event_cbs.set(e, [{cb, target}]);
}

function runCb(e) {
  const cbs = event_cbs.get(e);
  const firstTarget = cbs[0].target;
  let i = 1;
  while (cbs[i] && cbs[i].target === firstTarget)
    i++;
  const [{cb, target}] = cbs.splice(i - 1, 1);
  cb.call(target, e);
}

//register of the postPropagation one-two event listeners per target.
//necessary to:
//  a) removePostPropagationCallbacks, and
//  b) prevent the same cb object being added multiple times for the same event type and eventTarget
//     (same rule as for regular event listeners).
const target_cb_type_oneTwo = new WeakMap();

//Cache the target/cb/type to [one two].
//The cache is necessary to check for redundancy and remove the postPropagationCB
function registerPropagationCallback(target, cb, type, one, two) {
  let cb_type_oneTwo = target_cb_type_oneTwo.get(target);
  if (!cb_type_oneTwo)
    target_cb_type_oneTwo.set(target, cb_type_oneTwo = new WeakMap());
  let type_oneTwo = cb_type_oneTwo.get(cb);
  if (!type_oneTwo)
    cb_type_oneTwo.set(target, type_oneTwo = new Map());
  type_oneTwo.set(type, [one, two]);  //we can skip the last test, as this was done in the previous step.
}

const options1 = {capture: true, unstoppable: true};
const options2 = {capture: false, last: true, unstoppable: true};
const options3 = {capture: false, last: true, unstoppable: true, once: true};

function makeOne(cb, target, type) {
  return function postPropagationOne(e) {
    //a. add the cb to the list to be added.
    registerEventCbTarget(e, cb, target);
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

function makeTwo(target) {
  return function postPropagationTwo(e) {
    const lastTarget = lastPropagationTarget(e);
    lastTarget === target && runCb.call(target, e);
  };
}

//essentially a second bubble phase.
// c             b       p
//   c         b       p
//     c     b       p
//       b c       p
// The sequence of the targets are handled before the sequence when the callbacks were added
export function addPostPropagationCallback(target, type, cb) {
  //1. exit if the same combination target, type, cb is already added
  if (target_cb_type_oneTwo.get(target)?.get(cb)?.get(type))
    return;
  //2. make the stateful one two (three) closures
  const one = makeOne(cb, target, type);
  const two = makeTwo(target);
  //3. add the closures as event listener for the correct type
  target.addEventListener(type, one, options1);
  target.addEventListener(type, two, options2);
  //4. and add them to the register, so they can be both removed and avoid duplicates
  registerPropagationCallback(target, cb, type, one, two);
}

export function removePostPropagationCallback(target, type, cb) {
  const [one, two] = target_cb_type_oneTwo.get(target)?.get(cb)?.get(type);
  if (one) {
    target.removeEventListener(type, one, true);
    target.removeEventListener(type, two, false);
  }
}