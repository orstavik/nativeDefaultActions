const tabbableQuerySelector = "a[href]:not([tabindex='-1']), area[href]:not([tabindex='-1']), input:not([disabled]):not([tabindex='-1']), select:not([disabled]):not([tabindex='-1']), textarea:not([disabled]):not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']), iframe:not([tabindex='-1']), [tabindex]:not([tabindex='-1']), [contentEditable=true]:not([tabindex='-1'])";

import {
  auxclickNavigateDefaultAction,
  clickNavigateDefaultAction,
  enterToClickDefaultAction
} from "./polyfills_defaultActions/HTMLAnchorElement_navigate.js";
import {
  clickButtonResetDefaultAction,
  clickButtonSubmitDefaultAction,
  enterButtonDefaultAction
} from "./polyfills_defaultActions/HTMLButtonElement_click.js";
import {dblclickDefaultAction} from "./polyfills_defaultActions/HTMLElement_dblclick.js";
import {mousedownFocusDefaultAction} from "./polyfills_defaultActions/HTMLElement_mousedownFocus.js";
import {clickSummaryDefaultAction} from "./polyfills_defaultActions/HTMLElement_summary_click.js";
import {clickInputDefaultAction} from "./polyfills_defaultActions/HTMLInputElement_click.js";
import {
  enterOnInputSubmitResetButtonDefaultAction,
  enterOnInputTextDefaultAction
} from "./polyfills_defaultActions/HTMLInputElement_keydown.js";
import {mousedownOptionDefaultAction} from "./polyfills_defaultActions/HTMLOptionElement_mousedown.js";

export const nativeDefaultActions = [
  auxclickNavigateDefaultAction,
  clickNavigateDefaultAction,
  enterToClickDefaultAction,
  clickButtonResetDefaultAction,
  clickButtonSubmitDefaultAction,
  enterButtonDefaultAction,
  mousedownFocusDefaultAction,
  clickSummaryDefaultAction,
  clickInputDefaultAction,
  enterOnInputSubmitResetButtonDefaultAction,
  enterOnInputTextDefaultAction,
  mousedownOptionDefaultAction,
  dblclickDefaultAction
];
for (let nativeDA of nativeDefaultActions) {
  nativeDA.native = true;
  Object.freeze(nativeDA);
}
Object.freeze(nativeDefaultActions);