/**
 * This pure data structure declare the native default actions in HTML.
 *
 * Two hybrid query formats are used to describe the structure:
 * 1. eventQuery resembles "the query string format" used in urls.
 * 2. elementQuery resembles "query selectors" used in CSS and JS to located elements in the DOM.
 */

import {event_dblclick} from "../v1/polyfills/Event_dblclick.js";
import {requestNavigation} from "../v1/polyfills/HTMLAnchorElement_requestNavigation.js";
import {
  requestCheckboxToggle,
  implicable,
  implicableSelector
} from "../v1/polyfills/HTMLInputElement_requestCheckboxToggle.js";
import {requestSelect} from "../v1/polyfills/HTMLSelectElement_requestSelect.js";
import {defaultButton} from "../v1/polyfills/HTMLFormElement_defaultButton.js";


const tabbableQuerySelector = "a[href]:not([tabindex='-1']), area[href]:not([tabindex='-1']), input:not([disabled]):not([tabindex='-1']), select:not([disabled]):not([tabindex='-1']), textarea:not([disabled]):not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']), iframe:not([tabindex='-1']), [tabindex]:not([tabindex='-1']), [contentEditable=true]:not([tabindex='-1'])";

let previousClick;

export const listOfDefaultActions = {
  click: [{
    // element: HTMLElement,
    // defaultAction: function dblclick_controller(event, element) {
    //   if (!event.isTrusted)
    //     return;
    //   if (!previousClick || event.timeStamp - previousClick.timeStamp > 300) {
    //     previousClick = event;
    //     return;
    //   }
    //   return {
    //     defaultAction: function dispatch_dblclick() {
    //       previousClick = undefined;
    //       const dblclick = new MouseEvent("dblclick", {composed: true, bubbles: true});
    //       dblclick.async = event.async;
    //       dblclick.isTrusted = true;
    //       //copy over other event properties from click
    //       event.target.dispatchEvent(dblclick);
    //     },
    //     lowestWins: true,
    //     preventable: false,
    //     targetOnly: true
    //   }
    // }
  // }, {
  //   element: HTMLAnchorElement,
  //   defaultAction: function clickOnAnchorVerifyIsTrustedAndHref(event, element) {
  //     if (!event.isTrusted)
  //       return;
  //     if (!element.hasAttribute("href"))
  //       return;
  //     return {
  //       defaultAction: function anchorNavigateClick(event, element) {
  //         document.open(element.getAttribute("href"));
  //       },
  //       lowestWins: true,
  //       preventable: true,
  //       targetOnly: false
  //     }
  //   }
  // }, {
  //   element: HTMLInputElement,
  //   defaultAction: function ClickOnInput(event, element) {
  //     /*todo*/
  //   },
  //   lowestWins: true,
  //   preventable: true,
  //   targetOnly: true
  // }, {
  //   element: HTMLButtonElement,
  //   defaultAction: function clickOnButton(event, element) {
  //     if (!element.form)
  //       return;
  //     if (element.type === "submit")
  //       element.form.requestSubmit();
  //     else if (element.type === "reset")
  //       element.form.reset();
  //   },
  //   lowestWins: true,
  //   preventable: true
  // }, {
  //   element: "SUMMARY",
  //   defaultAction: function verifyDetailsSummaryFirstOfType(event, element) {
  //     if (!(element.parentNode instanceof HTMLDetailsElement))
  //       return;
  //     if (!element.matches(":first-of-type"))
  //       return;
  //     return {
  //       defaultAction: function summaryTogglesDetails(event, element) {
  //         element.parentNode.open = !element.parentNode.open;
  //       },
  //       lowestWins: true,
  //       preventable: true,
  //       targetOnly: false
  //     }
  //   }
  }],
  // auxclick: [{
  //   element: HTMLAnchorElement,
  //   defaultAction: function auxclickOnAnchorVerifyIsTrustedButton1AndHref(event, element) {
  //     if (!event.isTrusted)
  //       return;
  //     if (event.button !== 1)
  //       return;
  //     if (!element.hasAttribute("href"))
  //       return;
  //     return {
  //       defaultAction: function anchorNavigateAuxclick(event, element) {
  //         document.open(element.getAttribute("href"), "_BLANK");
  //       },
  //       lowestWins: true,
  //       preventable: true,
  //       targetOnly: false
  //     };
  //   }
  // }],
  mousedown: [{
  //   element: HTMLOptionElement,
  //   defaultAction: function mousedownOnOptionVerifySelectParentButton0IsTrusted(event, el) {
  //     if (!event.isTrusted)
  //       return;
  //     if (event.button !== 0)
  //       return;
  //     const select = el.parentNode instanceof HTMLOptGroupElement ? el.parentNode.parentNode : el.parentNode;
  //     if (!(select instanceof HTMLSelectElement))
  //       return;
  //     return {
  //       defaultAction: function optionRequestsSelect(event, el) {
  //         const select = el.parentNode instanceof HTMLOptGroupElement ? el.parentNode.parentNode : el.parentNode;
  //         requestSelect.call(select, el);
  //       },
  //       lowestWins: true,
  //       preventable: true,
  //       targetOnly: true
  //     };
  //   }
  // }, {
  //   element: HTMLElement,
  //   defaultAction: function FocusableTestingButton(event, el) {
  //     if (!event.isTrusted)
  //       return;
  //     if (event.button !== 0)
  //       return;
  //     if (el.disabled)
  //       return;
  //     if (!el.matches("a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contentEditable=true]"))
  //       return;
  //     return {
  //       defaultAction: function MousedownFocuses(event, element) {
  //         element.focus();
  //       },
  //       lowestWins: false,
  //       preventable: true,   //todo is it cancelable??
  //       targetOnly: false
  //     };
  //   }
  }],
  keydown: [{
    element: HTMLInputElement,
    defaultAction: function keydownOnInput(event, el) {
      if (!event.isTrusted)
        return;
      if (el.disabled)
        return;
      if (!el.matches(":focus")) //todo I think this is redundant. keydown cannot go somewhere were it isn't
        return;
      //todo what are the usecases here?? are there differing behavior for different types of input elements??
      //todo i need functions like this: enterOnInputText, enterOnInputRadio, enterOnInputDate...
      if (event.key === "Enter"){
        if (el.type === "text"){
          if(!el.form)
            return;                                      //":not(form) input[type=image]:default, ..." is not necessary as forms cannot be nested
          const defaultButton = el.form.querySelector("input[type=image]:default, input[type=submit]:default, button[type=submit]:default");
          if(defaultButton){
            return {
              defaultAction: function textEnterTriggerDefaultButton(event, element) {
                defaultButton.dispatchEvent(new MouseEvent("click", {
                  async: event.async,
                  composed: true,
                  bubbles: true,
                  cancelable: true,
                  isTrusted: true
                }));
              },
              lowestWins: true,
              preventable: true,
              targetOnly: false
            }
          }
          const implicableSelector =
            "input[type=text]," +
            "input[type=search]," +
            "input[type=url]," +
            "input[type=telephone]," +
            "input[type=email]," +
            "input[type=password]," +
            "input[type=date]," +
            "input[type=month]," +
            "input[type=week]," +
            "input[type=time]," +
            "input[type=datetime-local]," +
            "input[type=number]";
          const blockingImplicitSubmit = el.form.querySelectorAll(implicableSelector);
          if(blockingImplicitSubmit.length > 1)
            return;
          if(blockingImplicitSubmit.length !== 1 || blockingImplicitSubmit[0] !== element)
            throw new Error("enter on text default action selector is erroneous. Likely a bug in the CSS selector");
          return {
            defaultAction: function textEnterTriggerFormSubmit(event, element) {
              element.form.requestSubmit();
            },
            lowestWins: true,
            preventable: true,
            targetOnly: false
          }
        }
      }
        return {
          defaultAction: function enterOnInput(event, element) {
            element.dispatchEvent(new MouseEvent("click", {
              async: event.async,
              composed: true,
              bubbles: true,
              cancelable: true,
              isTrusted: true
            }));
          },
          lowestWins: true,
          preventable: true,
          targetOnly: false
        };
    }
  // }, {
  //   element: HTMLAnchorElement,
  //   defaultAction: function (event, el) {
  //     if (!event.isTrusted)
  //       return;
  //     if (el.disabled)
  //       return;
  //     if (!el.matches(":focus-within")) //todo I think this is redundant. keydown cannot go somewhere were it isn't
  //       return;
  //     return {
  //       defaultAction: function enterOnAnchor(event, element) {
  //         const click = new MouseEvent("click", {composed: true, bubbles: true});
  //         click.async = event.async;
  //         click.isTrusted = true;
  //         element.dispatchEvent(click);
  //       },
  //       lowestWins: true,
  //       preventable: true,
  //       targetOnly: false
  //     }
  //   }
  }]
};