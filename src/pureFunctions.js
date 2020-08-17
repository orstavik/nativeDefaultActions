//todo there is a potential bug in this one when the event originates from a fallback node inside a slot inside a web comp.
export function lastPropagationTarget(event) {
  const composedPath = event.composedPath();
  if (event.bubbles) return composedPath[composedPath.length - 1];
  if (!event.composed) return composedPath[0];
  //non-bubbling and composed
  let last = composedPath[0];
  let slots = 0;
  for (let i = 1; i < composedPath.length - 1; i++) {
    if (composedPath[i] instanceof ShadowRoot && slots === 0)
      last = composedPath[++i];
    else if(composedPath[i] instanceof ShadowRoot)
      slots--;
    else if(composedPath[i] instanceof HTMLSlotElement)
      slots++;
  }
  return last;
}

//todo make this based on the event.composedPathContexts()
export function shadowElements(target, path) {
  path = path.slice(0, path.indexOf(target) - 1); //this would be the shadowRoot and below. closed-mode would break it.
  if (!path.length)
    return path;
  let shadowRoot = path[path.length - 1];
  if (!(shadowRoot instanceof ShadowRoot))
    return [];
  let shadows = 0;
  for (let i = path.length - 2; i >= 0; i--) {
    const pathElement = path[i];
    if (pathElement instanceof ShadowRoot)
      shadows++;
    if (pathElement instanceof HTMLSlotElement && shadows === 0)
      return path.slice(i);
    if (pathElement instanceof HTMLSlotElement)
      shadows--;
  }
  return path;
}