import {DefaultActionMixin} from "../src/DefaultActionMixin.js";

class AA extends DefaultActionMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = "<slot></slot>";
  }

  static get defaultActions() {
    return [
      {
        element: AA,
        event: {
          type: "click",
          isTrusted: true
        },
        filterElement: function (event, el) {
          return el.hasAttribute("href");
        },
        defaultAction: function navigate(event, el) {
          document.open(el.href);
        },
        preventable: true,
        repeat: "lowestWins"
      }
    ]
  }
}

customElements.define("a-a", AA);

//useCase aaH1
// Flattened DOM                   | DOM context
//----------------------------------------------------------------
//  a-a[href=#sunshine]            | 1. main
//    aaRoot                       | A. aaRoot
//      aaSlot                     | A. aaRoot
//        h1                       | 1. main

//<a-a href=#sunshine>
//  <h1></h1>
//</a-a>

export function aaH1() {
  const aa = document.createElement("a-a");
  aa.setAttribute("href", "#sunshine")
  const h1 = document.createElement("h1");
  aa.appendChild(h1);

  const aaRoot = aa.shadowRoot;
  const aaSlot = aaRoot.children[0];

  const usecase = [
    h1,
    [
      aaSlot,
      aaRoot
    ],
    aa
  ];
  Object.freeze(usecase, true);
  return usecase;
}

//useCase aaCheckbox
// Flattened DOM                   | DOM context
//----------------------------------------------------------------
//  a-a[href=#sunshine]            | 1. main
//    aaRoot                       | A. aaRoot
//      aaSlot                     | A. aaRoot
//        input[type=checkbox]     | 1. main

//<a-a href=#sunshine>
//  <input type=checkbox>
//</a-a>

export function aaCheckbox() {
  const aa = document.createElement("a-a");
  aa.setAttribute("href", "#sunshine")
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox")
  aa.appendChild(input);

  const aaRoot = aa.shadowRoot;
  const aaSlot = aaRoot.children[0];

  const usecase = [
    input,
    [
      aaSlot,
      aaRoot
    ],
    aa
  ];
  Object.freeze(usecase, true);
  return usecase;
}