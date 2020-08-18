//expose the toggle method of the HTMLDetailsElement
export function toggle() {
  this.open =! this.open;
}