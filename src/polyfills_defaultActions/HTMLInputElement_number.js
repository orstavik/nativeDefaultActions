const numberChars = /\d\.e\+\-/;
const numbers = "0123456789e+-";

//todo when you press down on the upper button, you are using a statemachine here too
//todo the statemachine uses mousedown and then adds a setTimeout that in turn triggers setIntervals
//the first timer is maybe a second?
//the ensuing timers are maybe 250ms?
//todo the statemachine listens only for mousedown and mouseup and focusout.
