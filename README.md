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

```javascript
import {getDefaultActions} from "https://cdn.jsdelivr.net/gh/orstavik/nativeDefaultActions@1.1.0/src/getDefaultActions.js";

const listOfNativeDefaultActions = getDefaultActions(eventInstance);
``` 
