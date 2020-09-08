import {addPostPropagationCallback, removePostPropagationCallback} from "../postPropagationCallback.js";

function caretLeft(event, input) {
  input.setSelectionRange(0, 0);
}

function caretRight(event, input) {
  const right = input.value.length;
  const type = input.type;
  input.type = "text";
  if (input.setSelectionRange)
    input.setSelectionRange(right, right);
  input.type = type;
}

function getArrowDirection(event, input) {
  const distanceFromLeft = event.x - input.offsetLeft;
  const distanceFromTop = event.y - input.offsetTop;
  const paddingLeft = parseInt(window.getComputedStyle(input).paddingLeft);
  const paddingTop = parseInt(window.getComputedStyle(input).paddingTop);
  let width = input.getBoundingClientRect().width;
  let height = input.getBoundingClientRect().height;
  let factorFromLeft = distanceFromLeft / (width - paddingLeft * 2) * 100;
  let factorFromTop = distanceFromTop / (height - (paddingTop * 2)) * 100;
  if (factorFromLeft < 90)
    return null; //todo make this into a number, so that we can use it for position of the caret.
  return factorFromTop <= 50 ? "up" : "down";
}

function processInputValue(el, oldValue, newValue, min, max) {
  newValue < min && (newValue = min) && el.select();
  newValue > max && (newValue = max) && el.select();
  if (oldValue === newValue)
    return false;
  //"intervalId" variable is global variable. Maybe it is possible to pass it as event property
  intervalId = setInterval(function () {
    el.value = newValue;
    const input = new InputEvent("input", {bubbles: true, composed: true});
    el.dispatchEvent(input);
    return true; // to clearIt
  }, 250);
}

function getFilteredValue(value, min) {
  if (!value)
    return min || 1;
  let values = value.split("e");
  if (values["2"]) // if there are 2 e
    return min || 1;
  if (values && values["1"])
    return parseInt(values["0"]) * 10 ** parseInt(values["1"]) + 1;
  else
    return parseInt(value);
}

//todo when you press down on the upper button, you are using a statemachine here too
//todo the statemachine uses mousedown and then adds a setTimeout that in turn triggers setIntervals
//the first timer is maybe a second?
//the ensuing timers are maybe 250ms?
//todo the statemachine listens only for mousedown and mouseup and focusout.

function getConfiguredNumberInput(input) {
  const min = parseFloat(input.getAttribute("min")) || Number.NEGATIVE_INFINITY;
  const max = parseFloat(input.getAttribute("max")) || Number.POSITIVE_INFINITY;
  let step = parseFloat(input.getAttribute("step")) || 1;
  // negative step value
  if (step <= 0)
    step = 1;
  // convert input values
  const value = getFilteredValue(input.value, min); // convert "e" into a number and increase/decrease its number on step value
  // wrong values
  if (min > max)
    throw new SyntaxError("min value is bigger than max value for an input number.");
  if (max < min)
    throw new SyntaxError("max value is smaller than min value for an input number.");
  if (step > max)
    throw new SyntaxError("the step value is bigger than the max value for an input number.");
  return [min, max, step, value];
}

let activeStateMachine;

function startStateMachine(input, event, task) {
  activeStateMachine = {
    input,
    task,
    event,
    startValue: parseFloat(input.value),
    timer: setTimeout(runStateMachine, 1000)
  };
}

function stopStateMachine() {
  const [min, max, step, value] = getConfiguredNumberInput(activeStateMachine.input);
  const didChange = parseFloat(value) !== activeStateMachine.startValue;
  didChange && activeStateMachine.input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));
  clearTimeout(activeStateMachine.timer);
  activeStateMachine = undefined;
}

function runStateMachine() {
  activeStateMachine.task(activeStateMachine.input);
  activeStateMachine.timer = setTimeout(runStateMachine, 250);
}


function step(input, upDown) {
  const [min, max, step, oldValue] = getConfiguredNumberInput(input);
  let newValue = oldValue + (step * upDown);
  newValue = Number.isInteger(step) ? parseInt(newValue) : parseFloat(newValue);
  const didChange = processInputValue(input, oldValue, newValue, min, max);
  didChange && input.dispatchEvent(new InputEvent("input", {bubbles: true, composed: false}));
}

function stepUp(event, input) {
  return step(input, 1);
}

function stepDown(event, input) {
  return step(input, -1);
}


//Keyboard actions
//att. when holding down a key, the OS produces multiple keydown events after a second or so.
//     These keydown events come from the OS/browser, the default action do not need to replicate them.

let changeValue;

function checkChange(event, input) {
  const [a, b, c, newValue] = getConfiguredNumberInput(input);
  if(changeValue === newValue)
    return;
  changeValue = undefined;
  input.dispatchEvent(new InputEvent("change", {composed: true, bubbles: true}));
}

export const ArrowUpInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "keydown", isTrusted: true, key: "ArrowUp"},
  stateFilter: function (event, el) {
    return el.type === "number" /*&& !activeStateMachine*/;
  },
  defaultAction: function (event, input) {
    stepUp(event, input);
    checkChange(event, input);
  },
  repeat: "lowestWins",
  preventable: true
};

export const ArrowDownInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "keydown", isTrusted: true, key: "ArrowDown"},
  stateFilter: function (event, el) {
    return el.type === "number"/* && !activeStateMachine*/;
  },
  defaultAction: function (event, input) {
    stepDown(event, input);
    checkChange(event, input);
  },
  repeat: "lowestWins",
  preventable: true
};

export const FocusoutTriggerMousedownChangeInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "focusout", isTrusted: true},
  stateFilter: function (event, el) {
    return activeStateMachine /*&& el.type === "number" */;
  },
  defaultAction: stopStateMachine,
  repeat: "once",
  preventable: true
};

export const ArrowLeftInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "keydown", isTrusted: true, key: "ArrowLeft"},
  stateFilter: function (event, el) {
    return el.type === "number" && !activeStateMachine;
  },
  defaultAction: caretLeft,
  repeat: "lowestWins",
  preventable: true
};

export const ArrowRightInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "keydown", isTrusted: true, key: "ArrowRight"},
  stateFilter: function (event, el) {
    return el.type === "number" && !activeStateMachine;
  },
  defaultAction: caretRight,
  repeat: "lowestWins",
  preventable: true
};

const numberCharacter = /[\dEe+.-]/;

export const NumberKeysInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "keydown", isTrusted: true},
  stateFilter: function (event, el) {
    return el.type === "number" && numberCharacter.exec(event.key);
  },
  defaultAction: function(event, input){
    caretRight(event, input);
    changeValue = input.value;
    input.value += event.key;
    input.dispatchEvent(new InputEvent("input", {bubbles: true, composed: false}));
  },
  repeat: "lowestWins",
  preventable: true
};

// export const KeyupEndsKeydownStateMachine = {
//   element: HTMLInputElement,
//   event: {type: "keyup", isTrusted: true},
//   stateFilter: function (event, el) {
//     return activeStateMachine && activeStateMachine.event.type === "keydown" /* && el.type === "number"*/; //note 1
//   },
//   defaultAction: stopStateMachine,
//   repeat: "lowestWins",
//   preventable: true
// };

//todo the keydown and keyup stop of the statemachine should apply to the mousedown buttons too.
// export const KeydownEndsKeydownStateMachine = {
//   element: HTMLInputElement,
//   event: {type: "keydown", isTrusted: true},
//   stateFilter: function (event, el) {
//     return activeStateMachine && activeStateMachine.event.type === "keydown" /* && el.type === "number"*/; //note 1
//   },
//   defaultAction: stopStateMachine,
//   repeat: "lowestWins",
//   preventable: true
// };

export const FocusoutEndsKeydownStateMachine = {
  element: HTMLInputElement,
  event: {type: "focusout", isTrusted: true},
  // stateFilter: function (event, el) {
  //   return activeStateMachine /* && el.type === "number"*/; //note 1
  // },
  defaultAction: checkChange,
  repeat: "lowestWins",
  preventable: true
};


//STATEMACHINE FOR mousedown on up-button
export const MousedownStartUpInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "pointerdown", isTrusted: true, button: 0},
  stateFilter: function (event, el) {
    return el.type === "number" && !activeStateMachine && getArrowDirection(event, el) === "up";
  },
  defaultAction: function (event, input) {
    event.setPointerCapture(event.pointerId); //note 2.
    //todo lockFocus()
    stepUp(input);
    startStateMachine(input, event, stepUp);
  },
  repeat: "lowestWins",
  preventable: true
};

export const MouseupEndUpInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "pointerup", isTrusted: true, button: 0},
  stateFilter: function (event, el) {
    return activeStateMachine && activeStateMachine.type === "pointerdown" /* && el.type === "number"*/; //note 1
  },
  defaultAction: stepEnds,
  //todo add stopper for focus out()
  repeat: "lowestWins",
  preventable: true
};


//STATEMACHINE FOR mousedown on down-button
export const MousedownStartDownInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "pointerdown", isTrusted: true, button: 0},
  stateFilter: function (event, el) {
    return el.type === "number" && !activeStateMachine && getArrowDirection(event, el) === "down";
  },
  defaultAction: function (event, input) {
    event.setPointerCapture(event.pointerId); //note 2.
    stepDown(input);
    startStateMachine(input, event, stepDown);
  },
  repeat: "lowestWins",
  preventable: true
};

export const MouseupEndEndInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "pointerup", isTrusted: true, button: 0},
  stateFilter: function (event, el) {
    return activeStateMachine && activeStateMachine.type === "pointerdown" /* && el.type === "number"*/; //note 1
  },
  defaultAction: stepEnds,
  repeat: "lowestWins",
  preventable: true
};


export const MousedownUpEndInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keyup",
    isTrusted: true,
    key: "ArrowDown"
  },
  stateFilter: function (event, el) {
    return activeStateMachine && activeStateMachine.id === event.key /* && el.type === "number"*/; //note 1
  },
  defaultAction: function stepDownEnd(event, input) {
    const [min, max, step, value] = getConfiguredNumberInput(input);
    const didChange = parseFloat(value) !== activeStateMachine.startValue;
    didChange && input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));
    clearTimeout(activeStateMachine.timer);
    activeStateMachine = undefined;
  },
  repeat: "lowestWins",
  preventable: true
};


//MOVING CARET POSITION


export const ArrowLeftInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {type: "keydown", isTrusted: true, key: "ArrowLeft"},
  stateFilter: function (event, el) {
    return el.type === "number" && el.value && caretPosition > 0;
  },
  defaultAction: function stepLeft(event, input) {
    setCaretPosition(input, --caretPosition);
  },
  repeat: "lowestWins",
  preventable: true
};

export const ArrowRightInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "ArrowRight"
  },
  stateFilter: function (event, el) {
    return el.type === "number" && el.value;
  },
  defaultAction: function stepRight(event, input) {
    const key = event.key;
    if (key !== "ArrowRight")
      return;
    caretPosition++;
    if (caretPosition >= input.value.length)
      return caretPosition = input.value.length;
    setCaretPosition(input, caretPosition);
  },
  repeat: "lowestWins",
  preventable: true
};

export const KeydownInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "keydown",
    isTrusted: true,
    // key: "Tab" /todo: how to pass possible values? as an array? ["1","2"..."e". "E". "Tab"..]?
  },
  stateFilter: function (event, el) {
    return el.type === "number";
  },
  defaultAction: function inputNumberKeypress(event, input) {
    const parsedKey = parseInt(event.key) || event.key !== "Tab" || event.key !== "e" || event.key !== "E"
    if (!parsedKey)
      return;

    const [min, max, step, oldValue] = getConfiguredNumberInput(input);

    if (event.key === "Tab") {
      input.focus();
      return input.select(); //select valuewhen element get a focus by Tab press
    } else if (Number.isInteger(parsedKey)) {
      input.value += event.key;

      setTimeout(function () {
        const newValue = oldValue + event.key;
        const didChange = processInputValue(input, oldValue, newValue, min, max);
        didChange && input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));
      }, 250);
    }

  },
  repeat: "lowestWins",
  preventable: true
};

let valueOnMousedown;
export const mousedownInputNumberDefaultAction = {
  element: HTMLInputElement,
  event: {
    type: "mousedown",
    isTrusted: true,
    button: 0
  },
  stateFilter: function (event, el) {
    return el.type === "number";
  },
  defaultAction: function inputNumberMousedown(down, input) {
    input.focus();
    const [min, max, step, oldValue] = getConfiguredNumberInput(input);
    const arrowDirection = getArrowDirection(down);
    if (!arrowDirection)
      return; // if click on input field
    setTimeout(function () {
      const newValue = arrowDirection === "up" ? oldValue + step : oldValue - step;
      const didChange = processInputValue(input, oldValue, newValue, min, max);
      setCaretPosition(input, newValue.length);  //set caret to the end
      valueOnMousedown = oldValue;
      didChange && input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));
    }, 250);

    const downObserver = function (move) {
      if (!move.isTrusted)
        return;
      move.preventDefault();
      const [min, max, step, oldValue] = getConfiguredNumberInput(input);
      const arrowDirection = getArrowDirection(down);
      if (!arrowDirection)
        return; // if click on input field
      const newValue = arrowDirection === "up" ? oldValue + step : oldValue - step;
      processInputValue(input, oldValue, newValue, min, max);
    };

    const upObserver = function (up) {
      if (!up.isTrusted || up.button !== 0)
        return;
      up.preventDefault();
      clearInterval(intervalId); //global scope, because it is difficult to pass it via listener
      if (parseInt(input.value) !== valueOnMousedown)
        input.dispatchEvent(new InputEvent("change", {bubbles: true, composed: false}));

      removePostPropagationCallback(window, "mousedown", downObserver);
      removePostPropagationCallback(window, "mouseup", upObserver);
      removePostPropagationCallback(window, "focusout", focusoutObserver);
    };
    const focusoutObserver = function (focusout) {
      if (!focusout.isTrusted)
        return;
      removePostPropagationCallback(window, "mousedown", downObserver);
      removePostPropagationCallback(window, "mouseup", upObserver);
      removePostPropagationCallback(window, "focusout", focusoutObserver);
    };

    addPostPropagationCallback(window, "mousedown", downObserver);
    addPostPropagationCallback(window, "mouseup", upObserver);
    addPostPropagationCallback(window, "focusout", focusoutObserver);  // cant pass setInterval id here
  },
  repeat: "lowestWins",
  preventable: true
};

const numberChars = /\d\.e\+\-/;
const numbers = "0123456789e+-";

//todo when you press down on the upper button, you are using a statemachine here too
//todo the statemachine uses mousedown and then adds a setTimeout that in turn triggers setIntervals
//the first timer is maybe a second?
//the ensuing timers are maybe 250ms?
//todo the statemachine listens only for mousedown and mouseup and focusout.

//note 1:
//   bizarre edge case is altering the type of the input number while the statemachine runs.
//   While the statemachine is active, the type should be frozen.
//   The problems of the dynamic type is just infinite.

//note 2:
//   dispatch pointercancel?? to mark that the pointer has been taken for a particular gesture??
//   this one doesn't call preventDefault() on the mouse, so you still get the mouseevents being dispatched.
//   should a defaultAction capture the pointer?? from js or via a setting??
