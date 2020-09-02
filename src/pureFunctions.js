//todo there is a potential bug in this one when the event originates from a fallback node inside a slot inside a web comp.
export function lastPropagationTarget(event) {
  const composedPath = event.composedPath();
  if (event.bubbles) return composedPath[composedPath.length - 1];
  if (!event.composed) return composedPath[0];
  //non-bubbling and composed
  let last = composedPath[0];
  for (let i = 1, slots = 0; i < composedPath.length - 1; i++) {
    if(composedPath[i] instanceof HTMLSlotElement)
      slots++;
    else if(composedPath[i-1] instanceof ShadowRoot)
      slots === 0 ? (last = composedPath[i]) : slots--;
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

//todo alert the user that this one will fail the wasChildNodeOfSlotAssignedOriginallyAndViceVersa
export function contexts(path) {
  const contexts = new Array(path.length);
  let currentContext = contexts[contexts.length - 1] = path[path.length - 1];
  for (let i = path.length - 2; i >= 0; i--) {
    const node = path[i];
    contexts[i] = node instanceof ShadowRoot ? node : currentContext;
    //handle slotted paths... ahh... sweet, sweet <slot>s...
    if (!(node instanceof HTMLSlotElement))
      continue;
    if (i === 0) //<slot> can be the innermost target. Then it is like a normal element in the path.
      break;
    //we assume no assigned nodes have been turned into a fallback node and vice versa since the event was first dispatched.
    //This is a hole in the architecture of <slot> currently implemented in the specification.
    if (path[i - 1].parentNode === node)  //it is not an assignedNode, it is a fallback child.
      continue;  //<slot> can be a parentNode of a fallback node. Then it is also like a normal element in the path.
    //The <slot> has an assigned node as its "child" in the event's propagation path.
    //We must 'go back up' one context level, ie. to the context of the hostNode of the current "slotted" shadowDOM.
    const hostIndex = path.indexOf(currentContext) + 1;
    currentContext = contexts[hostIndex];
  }
  return contexts;
}

export function targets(path, contexts) {
  targets[0] = true;
  const targets = new Array(path.length);
  for (let i = 1, slots = 0; i < path.length; i++) {
    const element = path[i];
    const context = contexts[i];
    if (element instanceof HTMLSlotElement)
      slots++;        //step into a slotted context
    else if (element instanceof ShadowRoot)
      slots--;        //step out of a slotted context
    //host node and not inside a slotted context, then true, else false
    targets[i] = path[i - 1] instanceof ShadowRoot && slots === 0;
  }
  return targets;
}