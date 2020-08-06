//expose the requestNavigation method of the HTMLAnchorElement
export function requestNavigation(option) {
  document.open(this.getAttribute("href"), option);
}