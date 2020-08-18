
//<details>
//  <h1>
//  <summary#one>
//  <summary#two>
//  <h2>
function makeDetailsBranch() {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.id = "one";
  const summaryTwo = document.createElement("summary");
  summaryTwo.id = "two";
  const h1 = document.createElement("h1");
  const h2 = document.createElement("h2");
  details.appendChild(h1);
  details.appendChild(summary);
  details.appendChild(summaryTwo);
  details.appendChild(h2);
  return {details, h1, h2, summary, summaryTwo};
}

//details
//  h1
export function detailsH1() {
  const {details, h1, h2, summary, summaryTwo} = makeDetailsBranch();
  const usecase = [ h1, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  summary
export function detailsSummary() {
  const {details, h1, h2, summary, summaryTwo} = makeDetailsBranch();
  const usecase = [summary, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  summaryTwo
export function detailsSummaryTwo() {
  const {details, h1, h2, summary, summaryTwo} = makeDetailsBranch();
  const usecase = [summaryTwo, details];
  Object.freeze(usecase);
  return usecase;
}

//details
//  h2
export function detailsH2() {
  const {details, h1, h2, summary, summaryTwo} = makeDetailsBranch();
  const usecase = [h2, details];
  Object.freeze(usecase);
  return usecase;
}
