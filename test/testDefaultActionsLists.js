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

const OG = WeakMap.prototype.get;

function spoofIsTrusted(e) {
  WeakMap.prototype.get = function (obj) {
    return OG.call(this, obj?.spoofyDoo || obj);
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
  WeakMap.prototype.get = OG;
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
      const str = JSON.stringify(actions, replacer);
      console.log(str)
      res.push(str);
      e.preventDefault(); //we don't want these tests to run the default actions.
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
      const str = JSON.stringify(actions, replacer);
      console.log(str)
      res.push(str);
      e.preventDefault(); //we don't want these tests to run the default actions.
    });
    target.dispatchEvent(event);
  }
};