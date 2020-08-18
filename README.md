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

The `getDefaultActions(event)` method can easily be tested in devtools without any installation! 
In *any* existing application!! To test it out, do:

1. Open `wikipedia.org` and open devtools.
 
2. In the devtools console write (copy'n'paste):

```javascript
import("https://cdn.jsdelivr.net/gh/orstavik/nativeDefaultActions@1.1.3/src/getNativeDefaultActions.js").then(m => window.getDefaultActions = m.getDefaultActions);
```

This will import the `getDefaultActions(e)` function so that you can inspect any event for native default actions.

3. Then you can either add your own event listener by writing this directly into devtools: 
```javascript
window.addEventListener("click", function(e){
  debugger;
  const defaultActions = getDefaultActions(e);
  console.log(defaultActions); 
  e.preventDefault();
});
```

Or you can add a debug point in one of your/the website's existing event listeners.
  
3. Then, trigger the event. If you have used the example above and added your own event listener to `wikipedia.org`, 
then you can simply click on a link and see what happens.

Att!! The default actions for synthetic events are included. 
This means that functions such as `dblclick` are included in the list of default actions.  