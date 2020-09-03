export const clickInputRangeDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "mousedown",
    isTrusted: true
  },
  stateFilter: function (event, el) {
    return el.type === "range";
  },
  defaultAction: function inputRangeMousedown(event, el) {
    //todo here we need to add a statemachine for mousemove and mouseup
  },
  repeat: "lowestWins",
  preventable: true
};

export const ArrowLeftInputRangeDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "ArrowLeft"
  },
  stateFilter: function (event, el) {
    return el.type === "range";
  },
  defaultAction: function stepDown(event, el) {
    el.value -= el.step;
  },
  repeat: "lowestWins",
  preventable: true
};

export const ArrowRightInputRangeDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "ArrowRight"
  },
  stateFilter: function (event, el) {
    return el.type === "range";
  },
  defaultAction: function stepUp(event, el) {
    el.value += el.step;
  },
  repeat: "lowestWins",
  preventable: true
};