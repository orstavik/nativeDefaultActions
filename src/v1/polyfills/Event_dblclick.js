let lastClickTimeStamp;

/**
 * dblclick:
 *  1. uses the target of the last click as its target,
 *     it doesn't do any calculations to find the lowest, shared target of the first and second click.
 *  2. only react to isTrusted click events.
 *
 * @param clickTarget
 * @param notInUse
 * @param clickEvent should only react to "isTrusted==true" click events
 */
export function event_dblclick(clickEvent, clickTarget) {
  console.log("trying")
  if (!lastClickTimeStamp || (clickEvent.timeStamp - lastClickTimeStamp) > 300)
    return lastClickTimeStamp = clickEvent.timeStamp;
  console.log("dblclick")
  lastClickTimeStamp = undefined;
  dispatchEvent(new MouseEvent("dblclick", {composed: true, bubbles: true}), {async: true});
}