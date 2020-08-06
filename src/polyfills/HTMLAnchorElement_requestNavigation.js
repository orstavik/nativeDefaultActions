//expose the requestNavigation method of the HTMLAnchorElement
function requestNavigation(option) {
  document.open(this.getAttribute("href"), option);
}