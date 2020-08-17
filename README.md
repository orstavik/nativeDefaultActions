# nativeDefaultActions

Exposition of native default actions and pure functions to ascribe from an event.composedPath(). The library essentially produces a pure function `getDefaultActions(event)`. This pure function will produce an array of defaultAction objects. Each defaultAction object is in this format:

```javascript
{
  task: HTMLFormElement.requestSubmit.bind(the form element, the submitter),
  host: HTMLFormElement,
  index: 0,
  additive: false,
  irreversible: false,  //preventable
  native: true
}
``` 

## HowTo: use `getDefaultActions(e)`?

## Drop it into devtools!

The `getDefaultActions(event)` method can easily be tested in devtools without any installation! In *any* web app!!
 
1. Open the devtools console and write the following line of code (copy'n'paste):

```javascript
import("https://cdn.jsdelivr.net/gh/orstavik/nativeDefaultActions@1.1.3/src/getNativeDefaultActions.js").then(m => window.getDefaultActions = m.getDefaultActions);
```

This will import the necessary functions that can inspect any event for any native default actions.

2. Then, when you debug an event listener simply write `getDefaultActions(e)` which will produce a list of all default actions associated with the event.

Att! The default action list is complete. This means that it will include such event listeners as `dblclick` which will trigger for all `click` events (because the `dblclick` default action must *observe all `click` events* to know when to create a new `dblclick` event).  