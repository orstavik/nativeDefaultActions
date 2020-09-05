// There is no good querySelector for tabable elements that span across shadow-roots.
// There are several such CSS pseudo-classes that could be usable:
// 1. :tabable (highlight which elements can be reached using tab, all the time or as an animation triggered when
//              someone has keydown'ed tab). This pseudo-code would also likely be beneficial for making assistive screen readers for the blind, etc.)
// 2. :next-tab(num) num = 1, the next element reached by tab, -1, the next element reached by shift+tab, 2, the element reached when tab is pressed twice.
//              Again, useful to have as a css class to highlight keyboard based navigation and screen readers.
//  * for such tab-oriented css pseudo-classes there would likely be a need for
//
// const tabbableQuerySelector = "a[href]:not([tabindex='-1']), area[href]:not([tabindex='-1']), input:not([disabled]):not([tabindex='-1']), select:not([disabled]):not([tabindex='-1']), textarea:not([disabled]):not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']), iframe:not([tabindex='-1']), [tabindex]:not([tabindex='-1']), [contentEditable=true]:not([tabindex='-1'])";

function potentiallyTabables(root) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (node) {
        return (node.tabIndex >= 0 || (node.shadowRoot && node.getAttribute("tab-index") !== -1)) ?
          NodeFilter.FILTER_ACCEPT :
          NodeFilter.FILTER_SKIP;
      }
    },
    false);
  const res = [];
  for (let tabable = treeWalker.nextNode(); tabable; tabable = treeWalker.nextNode())
    res.push(tabable);
  res.sort(function (a, b) {
    if (a.tabIndex === b.tabIndex)
      return 0;
    if (a.tabIndex === -1)  //shadowRoot only
      return 1;
    if (b.tabIndex === -1)  //shadowRoot only
      return -1;
    if (a.tabIndex === 0)
      return 1;
    if (b.tabIndex === 0)
      return -1;
    return a.tabIndex >= b.tabIndex ? 1 : -1;      //a.tabIndex and b.tabIndex are positive integers
  });
  return res;
}

function recursiveTabables(root) {
  const potentials = potentiallyTabables(root); //correctly sorted
  const res = [];
  for (let potential of potentials) {
    if (potential.tabIndex !== -1)
      res.push(potential);
    if (potential.shadowRoot)
      res.push(recursiveTabables(potential.shadowRoot));
  }
  return res.flat(Infinity);
}

function nextTabable(root, start) {
  const allTabables = recursiveTabables(root);
  const index = allTabables.indexOf(start);
  let nextIndex = index + 1;
  if (nextIndex === allTabables.length)
    nextIndex = 0;//we can only iterate within the document, as we have no access to the browser chrome from JS.
  return allTabables[nextIndex];
}

function nextTab() {
  let lowest = document.activeElement;
  while (lowest.shadowRoot && lowest.shadowRoot.activeElement)
    lowest = lowest.shadowRoot.activeElement;
  return nextTabable(document, lowest);
}

//We choose to add this defaultAction to the DocumentFragment (ie. both shadowRoots and the document).
//Alternatives are:
//1. HTMLBodyElement. This would be good for low priority in the lowestWins hierarchy. In such a case, there would not be any problem having the tab
//The argument for adding this on the
export const tabOnBodyDefaultAction = {
  element: DocumentFragment,//HTMLBodyElement, Document, HTMLElement.. where should we associate the tab??
  event: {
    type: "keydown",
    isTrusted: true,
    key: "tab"
  },
  stateFilter: function(ev, el){
    return !!document.activeElement;
  },
  defaultAction: function tabFocus(event, element) {
    const next = nextTab();
    next && next.focus();
  },
  repeat: "lowestWins", //todo this could be repeat: document, but again we would need lowestWins on document..
  preventable: true
};