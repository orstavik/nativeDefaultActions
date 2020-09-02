import {addPostPropagationCallback} from "./postPropagationCallback.js";
import {stopImmediatePropagationOG} from "./blockStopPropagation.js";

function prepareDefaultActions(e){
  return getDefaultActions(e).filter(DA => DA.active && !DA.native);
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
    stopImmediatePropagationOG.call(e);
    preparedDefaultActions.delete(e);
  }
}

export function DefaultActionMixin(Base) {
  return class extends Base {
    constructor() {
      super();
      const defaultActions = this.constructor.defaultActions || [];
      const types = defaultActions.map(DA => DA.event.type);
      for (let type of types)
        addPostPropagationCallback(this, type, function (e) {
          processDefaultActions(e);
        });
    }
  };
}