function defaultActionToString(da) {
  return da.index + da.element.tagName + ":" + da.task.name + (da.additive ? "+" : "-");
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

export const nativeDefaultActionsTestIsTrusted = {
  name: "nativeDefaultActions(event.isTrusted)",
  fun: function (res, usecase, event) {
    const flatPath = usecase().flat(Infinity);
    const target = flatPath[0];
    const origin = flatPath[flatPath.length - 1];

    origin.addEventListener(event.type, function (e) {
      const eIsTrusted = spoofIsTrusted(e);
      const actions = nativeDefaultActions(eIsTrusted);
      const str = actions.map(defaultActionToString).join(" ");
      res.push(str);
    });
    target.dispatchEvent(event);
  }
};

export const nativeDefaultActionsTest = {
  name: "nativeDefaultActions(event)",
  fun: function (res, usecase, event) {
    const flatPath = usecase().flat(Infinity);
    const target = flatPath[0];
    const origin = flatPath[flatPath.length - 1];

    origin.addEventListener(event.type, function (e) {
      const actions = nativeDefaultActions(e);
      const str = actions.map(defaultActionToString).join(" ");
      res.push(str);
    });
    target.dispatchEvent(event);
  }
};

export const setDefaultActionTest = {
  name: "setDefault().defaultActions",
  fun: function (res, usecase, event) {
    const flatPath = usecase().flat(Infinity);
    const origin = flatPath[flatPath.length - 1];
    const target = flatPath[0];

    origin.addEventListener(event.type, function (e) {
      const actions = e.defaultActions;
      const str = actions.map(defaultActionToString).join(" ");
      res.push(str);
    });
    target.dispatchEvent(event); //sync dispatch
  }
};