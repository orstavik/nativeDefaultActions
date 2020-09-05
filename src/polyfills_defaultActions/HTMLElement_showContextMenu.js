export const showContextmenuDefaultAction = {
  element: HTMLElement,
  event: {
    type: "contextmenu",
    isTrusted: true
  },
  defaultAction: function display_contextmenu(event, element) {
    alert("poor excuse for a contextmenu: " + element.tagName);
  },
  repeat: "lowestWins",
  preventable: true
};