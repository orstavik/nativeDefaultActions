
//<details>
//  <h1>
//  <summary>
//    <h2>
//    <a href="#sunshine">
//      <h3>
//      <input type=checkbox>
function makeDetailsBranch() {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const a = document.createElement("a");
  a.setAttribute("href", "#sunshine")
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox")
  const h1 = document.createElement("h1");
  const h2 = document.createElement("h2");
  const h3 = document.createElement("h3");
  details.appendChild(h1);
  details.appendChild(summary);
  summary.appendChild(h2);
  summary.appendChild(a);
  a.appendChild(h3);
  a.appendChild(input);
  return {details, summary, a, input, h1, h2, h3};
}

//details
//  h1
export function detailsH1() {
  const {details, summary, a, input, h1, h2, h3} = makeDetailsBranch();
  const usecase = [h1, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  summary
export function detailsSummary() {
  const {details, summary, a, input, h1, h2, h3} = makeDetailsBranch();
  const usecase = [summary, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  summary
//    h2
export function detailsSummaryH2() {
  const {details, summary, a, input, h1, h2, h3} = makeDetailsBranch();
  const usecase = [h2, summary, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  summary
//    aHref
export function detailsSummaryAHref() {
  const {details, summary, a, input, h1, h2, h3} = makeDetailsBranch();
  const usecase = [a, summary, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  summary
//    aHref
//      h3
export function detailsSummaryAHrefH3() {
  const {details, summary, a, input, h1, h2, h3} = makeDetailsBranch();
  const usecase = [h3, a, summary, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  summary
//    aHref
//      input
export function detailsSummaryAHrefInputCheckbox() {
  const {details, summary, a, input, h1, h2, h3} = makeDetailsBranch();
  const usecase = [input, a, summary, details];
  Object.freeze(usecase);
  return usecase;
}
