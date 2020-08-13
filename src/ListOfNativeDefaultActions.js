import {event_dblclick} from "./polyfills/Event_dblclick.js";
import{requestNavigation} from "./polyfills/HTMLAnchorElement_requestNavigation.js";
import{requestCheckboxToggle} from "./polyfills/HTMLInputElement_requestCheckboxToggle.js";
import{requestSelect} from "./polyfills/HTMLSelectElement_requestSelect.js";

const focusableQuerySelector = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex], [contentEditable=true]";//option is not considered focusable, bad legacy design.

const tabbableQuerySelector = "a[href]:not([tabindex='-1']), area[href]:not([tabindex='-1']), input:not([disabled]):not([tabindex='-1']), select:not([disabled]):not([tabindex='-1']), textarea:not([disabled]):not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']), iframe:not([tabindex='-1']), [tabindex]:not([tabindex='-1']), [contentEditable=true]:not([tabindex='-1'])";

//todo sort this in a event type dictionary??
export const listOfDefaultActions = [{
  eventQuery: "click?isTrusted=true",     //isTrusted is not necessary for submit
  elementQuery: "*",
  method: (target, notInUse, event) => event_dblclick.bind(null, target, null, event),
  additive: true,
  irreversible: true
}, {
  eventQuery: "click?isTrusted=true",
  elementQuery: "a[href]",
  method: a => requestNavigation.bind(a)
}, {
  eventQuery: "auxclick?button=1&isTrusted=true",
  elementQuery: "a[href]",
  method: a => requestNavigation.bind(a, "_BLANK")
}, {
  eventQuery: "click",
  elementQuery: "input[type=checkbox]",
  method: input => requestCheckboxToggle.bind(input)
}, {
  eventQuery: "click",
  elementQuery: "details > summary:first-of-type",//todo check the :first-of-type CSS selector
  method: details => HTMLDetailsElement.prototype.toggle.bind(details)
}, {
  eventQuery: "mousedown?button=0&isTrusted=true",
  elementQuery: "select > option, select > optgroup > option",
  method: (select, option) => requestSelect.bind(select, option)
// }, {
//   eventQuery: "keydown?key=tab&isTrusted=true",
//   elementQuery: "select, input, body, textarea, button, blablabla",
//   method: focusable => nextTabIndex function how is that??
// }, {
//   eventQuery: "beforeinput?key=/[not a tab nor enter in regex]/&isTrusted=true",
  //todo here we need the regex, and is not legal inside the regex would be a simple solution.
//   elementQuery: "input, textarea",
//   method: textInput => if textInput instanceof input, add character to input, else add character to textarea
}, {
  eventQuery: "mousedown?button=0&isTrusted=true",
  elementQuery: focusableQuerySelector,
  method: focusable => HTMLElement.prototype.focus.bind(focusable),
  additive: true
}, {
  eventQuery: "click",                    //isTrusted is not necessary for reset
  elementQuery: "form button[type=reset], form input[type=reset]",
  method: form => HTMLFormElement.prototype.reset.bind(form)
}, {
  eventQuery: "click",                    //isTrusted is not necessary for submit
  elementQuery: "form button[type=submit], form input[type=submit]",
  method: (form, button) => HTMLFormElement.prototype.requestSubmit.bind(form, button)
}];
//tab?? does this produce a default action?? I think yes
//other characters for input and textarea..