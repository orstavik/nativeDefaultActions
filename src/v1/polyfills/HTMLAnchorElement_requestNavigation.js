//expose the requestNavigation method of the HTMLAnchorElement
export function requestNavigation(option) {
  const href = this.getAttribute("href");
  if (href !== null)
    document.open(href, option);
}