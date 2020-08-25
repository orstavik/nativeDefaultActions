# WhatIs: the timing of default action matching?

When the browser matches a default action with an event, it does so in the following four steps and at the following two times:

1. When the event is dispatched (think of it like *immediately before* the event begins propagation), the browser *can* verify the following criteria for each event in order to allocate the corresponding default actions:
   1. `event.type`
   2. element type. The elements in the event's propagation paths interface(s),  such as `HTMLElement` and/or `HTMLFormElement`
   3. **passive**. The passive special case. Chrome will read the state of the DOM, more specifically the state of the event listeners associated with the event *before* propagation to evaluate if touch based scrolling can begin even before the touch event is dispatched. This is a completely custom pattern used only for touch / scroll events by Chrome.

2. after the event has completed propagation, and a series of observations can be made to identify more precisely which default action will be triggered. These actions can look at both the state of the event and the state of the dynamic DOM at the end of propagation to evaluate which task(s) should be triggered.
   1. **static event properties** such as `isTrusted=true` and `e.key`. These properties can be handled always, but is better to handle secondarily as that enables the browser to avoid parsing and matching such values in cases where preventDefault() is called. However, it is beneficial to describe these properties as declaratively as possible to facilitate easier recognition.
   2. **dynamic event properties** such as `button=0`. No event property that is used to evaluate a default action should be dynamic. The button property on the `auxclick` event for example should not be possible to manipulate to cause a different action.
   3. **dynamic element/DOM properties** such as HTML attributes `[draggable=true]`.  
    and/or CSS properties such as `user-select` and `touch-action`.

## Architecture

1. the element type is matched with the event type. This is a static match. As neither the elements in the propagtion path, these elements' type nor the event type can change during propagation, it doesn't matter if this matching process is done at the beginnning of propagation, during propagation, or after propagation. The static match return a function we can call defaultActionSelector. When an event is matched with an element to produce a defaultActionSelector, we call the element the `host` of the defaultAction.

2. The defaultActionSelector can *read* event properties, element properties, and the properties of the DOM context (most likely limited to the same DOM/`document` context??) surrounding the element. As these properties can be both static and dynamic, the defaultActionSelector is divided in two steps:
    1. `staticSelector`. This function accepts the (event, element) as arguments. It can only *read* `static` properties of the event. The staticDefaultActionSelector function will yield the same result when it runs at the very beginning of, in the middle of, or at the very end of propagation (because it only should read static properties of the event path and event). It returns:
       * `undefined` if it with certainty can specify that no default action will be produced by this event and propagation path.
       * defaultActionObject
       * a dynamicSelectorObject. An object with a single `dynamicSelector` property. 
     
    2. `dynamicSelector`. A dynamicSelector is a function that reads dynamic data about the event, element and DOM context surrounding the element. Examples of such properties are `event.button`, html attributes such as `[href]`, style properties such as `user-select`, etc. These properties can be changed by event listeners during an event's propagation, and therefore the result/output from a dynamic defaultActionSelector can vary during the propagation of a single event instance. The dynamicSelector returns:
        * `undefined` if no defaultAction fits, or 
        * a defaultActionObject.
        
    3. `defaultAction`. A defaultActionObject has four properties: `cancelable`, `excludable`, `native`, and `task`. The `task` is a function that accepts two arguments, `event` and `element`. 
        
Neither the staticSelector nor the dynamicSelector should change any state, anywhere. They should only read state, with different restrictions. The defaultAction should change state, that is its purpose.

## Implementation: pseudo 1

To match an event to a defaultActionTask, the following pair needs specifying:

```
{
  event: "eventTypeStringName",
  element: elementClass || "tagName",
  staticSelector: function staticDefaultActionSelector(event, element){
      if(1)
        return {
          dynamicSelector: function(event, element){}
        }
      if(2) 
        return {
          defaultAction: function(event, element){...},
          preventable,
          lowestWins
        };
  }
}

{
  event: "eventTypeStringName",
  element: elementClass || "tagName",
  dynamicSelector: function dynamicSelector(event, element){
    if(1)
      return {
        defaultAction: function(event, element){...},
        preventable,
        lowestWins
      }
    //return undefined;
  }
}

{
  event: "eventTypeStringName",
  element: elementClass || "tagName",
  defaultAction: function(event, element){...},
  preventable,
  lowestWins
}
```

## Implementation: alt 1 and two

These selectors can be added to a list. The list will very much echo the structure above.

Alternatively, each list can be added as a static getter on the different HTMLElement interfaces. This can be beneficial when the system needs to be extendable, which is the case for web components and event controllers (such as `[draggable=true]` events). When this is the case, each element should provide a static getter which accepts an eventType and returns either a single dynamicSelector() or a staticSelector(), or a staticSelector() pluss a list of dynamicSelectors().   

```javascript
class WebComponent extends HTMLElement{
  static defaultActions(eventType){
    if(eventType === "click"){
      return {
        defaultAction: function defaultActionX(event, element){...},
        preventable,
        lowestWins,
        native
      };
    }
    if(eventType === "keydown"){
      return {
        staticSelector: function staticSelectorY(event, element){
            if(1)
              return {
                dynamicSelector: function dynamicSelectorY2(event, element){...}
              }
            if(2) 
              return {
                defaultAction: function defaultActionY1(event, element){},
                preventable,
                lowestWins,
                native
              };
          }
        }
    }
    if(eventType === "auxclick"){
      return {
        dynamicSelector: function dynamicSelectorZ(event, element){
            if(1) 
              return {
                defaultAction: function defaultActionZ(event, element){},
                preventable,
                lowestWins,
                native
              };
          }
        }
    }
  }
}
```
    
## References
 
 *