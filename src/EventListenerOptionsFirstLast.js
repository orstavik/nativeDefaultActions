const listenerRegistry = new WeakMap();

//keeps all firsts at the head of the list, and all lasts at the end
function addListener(target, type, cb, options) {
  const newListener = makeListener(type, cb, options);
  const listeners = listenerRegistry.get(target);
  if (listeners) {
    if (newListener.first) {
      const index = listeners.findIndex(listener => !listener.first);
      listeners.splice(index, 0, newListener);
    } else if (!newListener.last) {
      const index = listeners.findIndex(listener => listener.last);
      listeners.splice(index, 0, newListener);
    } else
      listeners.push(newListener);

  } else
    listenerRegistry.set(target, [newListener]);
}

function makeListener(type, listener, options) {
  if (options instanceof Object)
    return Object.assign({type, listener, passive: true, once: false, capture: false}, options);
  return Object.assign({type, listener, passive: true, once: false, capture: !!options});
}

function hasListeners(target, type, cb, options) {
  const listeners = listenerRegistry.get(target);
  if (!listeners)
    return false;
  const capture = options instanceof Object ? options.capture : !!options;
  return !!listeners.find(listener => listener.listener === cb && listener.type === type && listener.capture === capture);
}

function removeListener(target, type, cb, options) {
  const listeners = listenerRegistry.get(target);
  if (!listeners)
    return false;
  const capture = options instanceof Object ? options.capture : !!options;
  const index = listeners.findIndex(listener => listener.listener === cb && listener.type === type && listener.capture === capture);
  if (index === -1)
    return false;
  listeners.splice(index, 1);
  return true;
}

export function getListeners(target, type) {
  const listeners = listenerRegistry.get(target);
  if (!listeners)
    return [];
  if(!type)
    return listeners;
  return listeners.filter(listener => listener.type === type);
}

const addEventListenerOG = EventTarget.prototype.addEventListener;
const removeEventListenerOG = EventTarget.prototype.removeEventListener;

Object.defineProperty(EventTarget.prototype, "addEventListener", {
  value: function (type, cb, options) {
    if (hasListeners(this, type, cb, options))
      return;

    addListener(this, type, cb, options);
    if (options?.first) {
      addEventListenerOG.call(this, type, cb, options);
      for (let listener of getListeners(this, type).filter(listener => !listener.first)) {
        removeEventListenerOG.call(this, type, listener.listener, listener);
        addEventListenerOG.call(this, type, listener.listener, listener);
      }
    } else if (options?.last) {
      addEventListenerOG.call(this, type, cb, options);
    } else {
      addEventListenerOG.call(this, type, cb, options);
      for (let listener of getListeners(this, type).filter(listener => listener.last)) {
        removeEventListenerOG.call(this, type, listener.listener, listener);
        addEventListenerOG.call(this, type, listener.listener, listener);
      }
    }
  }
});

Object.defineProperty(EventTarget.prototype, "removeEventListener", {
  value: function (type, cb, options) {
    removeListener(this, type, cb, options);
    removeEventListenerOG.call(this, type, cb, options);
  }
});