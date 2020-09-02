let previousClick;

export const dblclickDefaultAction = {
  element: HTMLElement,
  event: {
    type: "click",
    isTrusted: true
  },
  //targetOnly and composed ensures that the function is only run on the innermost target.
  //This ensures that the dblclick_filter is not needlessly run multiple times.
  elementFilter: function dblclick_filter(event, element) {
    if(previousClick === event)
      return false;
    if (previousClick && event.timeStamp - previousClick.timeStamp <= 300) {
      previousClick = undefined;
      return true;
    }
    previousClick = event;
    return false;
  },
  defaultAction: function dblclick_dispatch(event, element) {
    const dblclick = new MouseEvent("dblclick", {composed: true, bubbles: true});
    dblclick.async = event.async;
    dblclick.isTrusted = true;
    //copy over other event properties from click
    event.target.dispatchEvent(dblclick);
  },
  repeat: "once",
  preventable: false
};