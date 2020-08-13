function defaultActionToString(da) {
  return da.index + da.element.tagName + ":" + da.task.name + (da.additive ? "+" : "-");
}

function printDefaultAction(action) {
  action = Object.assign({}, action);
  if (action.host)
    action.host = action.host.tagName || typeof (action.host);
  if (action.element)
    action.element = action.element.tagName || typeof (action.element);
  action.task = action.task.name;
  return JSON.stringify(action);
}

function printDefaultActions(actions) {
  return "[" + actions.map(act => printDefaultAction(act)).join(", ") + "]";
}

function spoofIsTrusted(e) {
  return new Proxy(e, {
    get(obj, key) {
      if (key === "isTrusted")
        return true;
      const val = Reflect.get(obj, key);   //if we use obj[key], we get an infinite loop
      return val instanceof Function ? val.bind(obj) : val;
    }
  });
}

export const getDefaultActionsTestIsTrusted = {
  name: "getDefaultActions(event.isTrusted)",
  fun: function (res, usecase, event) {
    const flatPath = usecase().flat(Infinity);
    const target = flatPath[0];
    const origin = flatPath[flatPath.length - 1];

    origin.addEventListener(event.type, function (e) {
      const eIsTrusted = spoofIsTrusted(e);
      const actions = getDefaultActions(eIsTrusted);
      const str = printDefaultActions(actions);
      console.log(str)
      res.push(str);
    });
    target.dispatchEvent(event);
  }
};

export const getDefaultActionsTest = {
  name: "getDefaultActions(event)",
  fun: function (res, usecase, event) {
    const flatPath = usecase().flat(Infinity);
    const target = flatPath[0];
    const origin = flatPath[flatPath.length - 1];

    origin.addEventListener(event.type, function (e) {
      //to get the dblclick we need to spoof the isTrusted of the click event.
      const actions = getDefaultActions(e);
      const str = printDefaultActions(actions);
      console.log(str)
      res.push(str);
    });
    target.dispatchEvent(event);
  }
};