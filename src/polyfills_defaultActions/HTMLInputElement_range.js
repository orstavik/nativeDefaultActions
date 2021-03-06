import {addPostPropagationCallback, removePostPropagationCallback} from "../postPropagationCallback.js";

function processInputValue(el, oldValue, newValue, min, max) {
  newValue < min && (newValue = min);
  newValue > max && (newValue = max);
  if (oldValue === newValue)
    return false;
  el.value = newValue;
  const input = new InputEvent("input", {bubbles: true, composed: true});
  el.dispatchEvent(input);
  return true;
}

// https://html.spec.whatwg.org/multipage/input.html#the-step-attribute
function getConfiguredRangeInput(input) {
  let min = parseInt(input.getAttribute("min")) || 0;  // Or I must parse float??
  let max = parseInt(input.getAttribute("max")) || 100;
  let step = parseFloat(input.getAttribute("step")) || 1;
  // negative step value
  if (step <= 0)
    step = 1;
  // wrong values
  if (min > max)
    throw new SyntaxError("min value is bigger than max value for an input range.");
  if (max < min)
    throw new SyntaxError("max value is smaller than min value for an input range.");
  if (step > max)
    throw new SyntaxError("the step value is bigger than the max value for an input range.");
  return [min, max, step, parseInt(input.value)];
}

function factorFromLeft(mouseEvent, input) {
  const distanceFromLeft = mouseEvent.offsetLeft - input.offsetLeft;
  const width = input.getBoundingClientRect().width;
  let factorFromLeft = distanceFromLeft / width;
  if (factorFromLeft < 0)
    return 0;
  if (factorFromLeft > 1)
    return 1;
  return factorFromLeft;
}


let valueOnMousedown;

export const mousedownInputRangeDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  stateFilter: function (event, el) {
    return el.type === "range";
  },
  defaultAction: function inputRangeMousedown(down, input) {
    const [min, max, step, oldValue] = getConfiguredRangeInput(input);
    const newValue = (max - min) * factorFromLeft(down, input) + min;
    processInputValue(input, oldValue, newValue, min, max);
    valueOnMousedown = oldValue;


    //todo there is a problem with this type of statemachine.
    // it doesn't mark the actions taken on mousemove and mouseup as defaultActions lowestWins.
    // this means that it can come into conflict with other defaultActions higher up in the DOM,
    // and although it should alert the other default actions about this problem, it doesn't.
    // To fix this issue, we should add the moveObserver and the upObserver and the focusoutObserver
    // as dynamic default actions instead. However, this is not so simple either, as the default action would
    // registered on the window, and not the lower input element, and the lower element will often not exist in the
    // composed path of the new mousemove and mouseup events.
    // instead, the postPropagation callbacks call preventDefault() on the move and up events (but not the focusout() event)
    const moveObserver = function (move) {
      if (!move.isTrusted)
        return;
      move.preventDefault();
      const [min, max, step, oldValue] = getConfiguredRangeInput(input);
      const newValue = (max - min) * factorFromLeft(down, input) + min;
      processInputValue(input, oldValue, newValue, min, max);
    };
    const upObserver = function (up) {
      if (!up.isTrusted || up.button !== 0)
        return;
      up.preventDefault();
      if(parseInt(input.value) !== valueOnMousedown)
        input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));

      removePostPropagationCallback(window, "mousemove", moveObserver);
      removePostPropagationCallback(window, "mouseup", upObserver);
      removePostPropagationCallback(window, "focusout", focusoutObserver);
    };
    const focusoutObserver = function (focusout) {
      if (!focusout.isTrusted)
        return;
      removePostPropagationCallback(window, "mousemove", moveObserver);
      removePostPropagationCallback(window, "mouseup", upObserver);
      removePostPropagationCallback(window, "focusout", focusoutObserver);
    };

    addPostPropagationCallback(window, "mousemove", moveObserver);
    addPostPropagationCallback(window, "mouseup", upObserver);
    addPostPropagationCallback(window, "focusout", focusoutObserver);
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
  defaultAction: function stepDown(event, input) {
    const [min, max, step, oldValue] = getConfiguredRangeInput(input);
    const newValue = oldValue - step;
    const didChange = processInputValue(input, oldValue, newValue, min, max);
    didChange && input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));
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
  defaultAction: function stepUp(event, input) {
    const [min, max, step, oldValue] = getConfiguredRangeInput(input);
    const newValue = oldValue + step;
    const didChange = processInputValue(input, oldValue, newValue, min, max);
    didChange && input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));
  },
  repeat: "lowestWins",
  preventable: true
};