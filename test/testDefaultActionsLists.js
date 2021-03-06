function replacer(key, value) {
  if (value instanceof Function)
    return value.name;
  if (value instanceof HTMLElement)
    return value.tagName;
  if (value instanceof DocumentFragment)
    return "#shadow"
  if (value === document)
    return "document"
  if (value === window)
    return "window"
  return value;
}

let WeakMapOG;
let matchesOG;

function spoofIsTrusted(e) {
  matchesOG = HTMLElement.prototype.matches;
  HTMLElement.prototype.matches = function (str) {
    str = str.replace(":focus", "");
    return matchesOG.call(this, str);
  }
  WeakMapOG = WeakMap.prototype.get;
  WeakMap.prototype.get = function (obj) {
    return WeakMapOG.call(this, obj?.spoofyDoo || obj);
  }
  return new Proxy(e, {
    get(obj, key) {
      if (key === "isTrusted")
        return true;
      if (key === "spoofyDoo")
        return e;
      const val = Reflect.get(obj, key);   //if we use obj[key], we get an infinite loop
      return val instanceof Function ? val.bind(obj) : val;
    }
  });
}

function unspoofIsTrusted() {
  WeakMap.prototype.get = WeakMapOG;
  HTMLElement.prototype.matches = matchesOG;
}

function minimizeDefaultActions(actions) {
  actions = actions.filter(da => da.active).map(da => ({
    elementInstance: da.elementInstance,
    index: da.index,
    defaultAction: da.defaultAction
  }));
  return JSON.stringify(actions, replacer);
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
      unspoofIsTrusted();
      const str = minimizeDefaultActions(actions)
      // console.log(str);
      res.push(str);
      e.preventDefault(); //we don't want these tests to run the default actions.
    }, true);
    target.dispatchEvent(event);
  }
};

export const getDefaultActionsTest_NOT_TRUSTED = {
  name: "getDefaultActions(event)",
  fun: function (res, usecase, event) {
    const flatPath = usecase().flat(Infinity);
    const target = flatPath[0];
    const origin = flatPath[flatPath.length - 1];

    origin.addEventListener(event.type, function (e) {
      //to get the dblclick we need to spoof the isTrusted of the click event.
      const actions = getDefaultActions(e).filter(da=> da.active);
      const str = minimizeDefaultActions(actions);
      // console.log(str)
      res.push(str);
      e.preventDefault(); //we don't want these tests to run the default actions.
    });
    target.dispatchEvent(event);
  }
};