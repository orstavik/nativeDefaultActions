/**
 * This pure data structure declare the native default actions in HTML.
 *
 * Two hybrid query formats are used to describe the structure:
 * 1. eventQuery resembles "the query string format" used in urls.
 * 2. elementQuery resembles "query selectors" used in CSS and JS to located elements in the DOM.
 */

import {event_dblclick} from "./polyfills/Event_dblclick.js";
import{requestNavigation} from "./polyfills/HTMLAnchorElement_requestNavigation.js";
import{requestCheckboxToggle} from "./polyfills/HTMLInputElement_requestCheckboxToggle.js";
import{requestSelect} from "./polyfills/HTMLSelectElement_requestSelect.js";
import {toggle} from "./polyfills/HTMLDetailsElement_toggle.js";
import {defaultButton} from "./polyfills/HTMLFormElement_defaultButton.js";

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
  elementQuery: "details > summary:first-of-type",
  method: details => toggle.bind(details)
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
},
  //enter-to-click default actions.
  //The .isTrusted property is transferred from the keydown to the click event. This is not possible in JS.
  //todo enter on select, summary?? it must be a focusable element??
  //todo could it be simplified to something like ":focus"?? that it just turns anything that has `:focus` to be clicked?? That would be good...
  //todo and then there would be a special case for ":focus" for other input elements such as text... No.. I think this is much more semantic than that.. More complex.
{
  eventQuery: "keydown?key=Enter&isTrusted=true",
  elementQuery: "form input[type=reset]:focus, form button[type=reset]:focus, form button[type=submit]:focus, form input[type=submit]:focus",
  method: (form, button) => HTMLElement.prototype.click.bind(button, {isTrusted: true})
}, {
  eventQuery: "keydown?key=Enter&isTrusted=true",
  elementQuery: "a[href]:focus",
  method: a => HTMLElement.prototype.click.bind(a, {isTrusted: true})
}, {
  eventQuery: "keydown?key=Enter&isTrusted=true",
  elementQuery: "form:state(defaultButton) input[type=text]:focus",
  method: (form, inputText) => HTMLElement.prototype.click.bind(defaultButton(form), {isTrusted: true})
}];
//tab?? does this produce a default action?? I think yes
//other characters for input and textarea..

//generic default actions
//1. contextmenu, "*".
//2. drag'n'drop, "[draggable]". add more to the queryselector here, not everything marked [draggable] can be dragged?? We also need a queryselector format that queries for css properties..
//3. keydown enter produces click. I think this should be "a[href], input, button, textarea, select"?? is it the same as focusable?? no there are special rules here..
//4. the deadcaps controller. this is a mess.. produces composition events and beforeinput (except in old firefox).
//   deadcaps are currently actually handled by input and textarea..

//todo
// 1. we are lacking the support for regex in the event property query.
//    This is important when we work with keydown default actions.
// 2. we need to complete the full list of default actions.
//    a. write up the default actions, and be careful not to add event controller default actions, such as contextmenu.
//       examples of event controller default actions are contextmenu and keypress-to-click
//       write a list of both the default actions that come from event controllers and elements here.
// 3. add more and check the list of all exposed getDefaultAction methods.. we use modern chrome behavior as guide.