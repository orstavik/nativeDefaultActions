export const stopPropagationOG = Event.prototype.stopPropagation;
export const stopImmediatePropagationOG = Event.prototype.stopImmediatePropagation;

Object.defineProperties(Event.prototype, {
  stopPropagation: {
    value: function () {
      console.warn(".stopPropagation() should be deprecated.");
    }
  },
  stopImmediatePropagation: {
    value: function () {
      console.warn(".stopImmediatePropagation() should be deprecated.");
    }
  }
});