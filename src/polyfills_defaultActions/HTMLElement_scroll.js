const stepFactor = [0.1, 0.3, 0.3, 0.2, 0.1];

let statemachine = [];

function doScroll(el) {
  const deltaY = statemachine.shift();
  const before = el.scrollTop;
  el.scrollBy(0, deltaY);
  const after = el.scrollTop;
  if (!statemachine.length || after - before !== deltaY)
    return;
  requestAnimationFrame(doScroll.bind(null, el));
}

function scrollBottom(el) {
  return el.scrollHeight - (el.scrollTop + el.clientHeight);
}

export const bodyScrollWheelDefaultAction = {
  element: HTMLBodyElement,
  event: {
    type: "wheel",
    isTrusted: true
  },
  stateFilter: function wheelCanScroll(ev, el) {
    return statemachine.length ||                //a scroll animation is ongoing, we must check for change of direction
      ev.deltaY < 0 && el.scrollTop > 0 ||       //scrolling up, and we are not at the top yet
      !(ev.deltaY < 0) && scrollBottom(el) > 0;  //scrolling down, when we are not at the bottom
  },
  defaultAction: function wheelScroll(ev, el) {
    const scrollOngoing = !!statemachine.length;
    if (scrollOngoing && (statemachine[0] > 0 ^ ev.deltaY > 0))    //Is the direction of the scroll up/down changing while the scroll animation is ongoing?
      statemachine = [];                                           //if so, then we reset the statemachine. Ie. this scroll animation "turns on a dime".
    const distance = ev.deltaY < 0 ? -50 : 50;     //Every wheel event adds 50px scroll
    for (let i = 0; i < 5; i++)                    //split over a 5 step animation.
      statemachine[i] += stepFactor[i] * distance;
    if (!scrollOngoing)                            //If the raf animation is not already ongoing,
      doScroll(el);                                // start it.
  },
  repeat: "lowestWins",
  preventable: true
};

export const pageUpScrollOnBodyDefaultAction = {
  element: HTMLBodyElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "PageUp"
  },
  stateFilter: function scrollPageUp(ev, el) {
    return el.scrollTop !== 0;
  },
  defaultAction: function pageUpScroll(ev, el) {
    const scrollOngoing = !!statemachine.length;
    const onePage = Math.min(el.clientHeight * 0.87, el.scrollTop);

    statemachine = stepFactor.map(n => n * -onePage);
    if (!scrollOngoing)
      doScroll(el);
  },
  repeat: "lowestWins",
  preventable: true
};

export const pageDownScrollOnBodyDefaultAction = {
  element: HTMLBodyElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "PageDown"
  },
  stateFilter: function scrollPageDown(ev, el) {
    return scrollBottom(el) > 0;
  },
  defaultAction: function pageDownScroll(ev, el) {
    const scrollOngoing = !!statemachine.length;
    const onePage = Math.min(el.clientHeight * 0.87, scrollBottom(el));
    statemachine = stepFactor.map(n => n * onePage);
    if (!scrollOngoing)
      doScroll(el);
  },
  repeat: "lowestWins",
  preventable: true
};
export const homeScrollOnBodyDefaultAction = {
  element: HTMLBodyElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "Home"
  },
  stateFilter: function scrollHome_filter(ev, el) {
    return el.scrollTop !== 0;
  },
  defaultAction: function homeScroll(ev, el) {
    const scrollOngoing = !!statemachine.length;
    const distance = el.scrollTop;
    statemachine = stepFactor.map(n => n * -distance);
    if (!scrollOngoing)
      doScroll(el);
  },
  repeat: "lowestWins",
  preventable: true
};

export const endScrollOnBodyDefaultAction = {
  element: HTMLBodyElement,
  event: {
    type: "keydown",
    isTrusted: true,
    key: "End"
  },
  stateFilter: function scrollEnd_filter(ev, el) {
    return (el.scrollTop + el.clientHeight) >= el.scrollHeight;
  },
  defaultAction: function endScroll(ev, el) {
    const scrollOngoing = !!statemachine.length;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    statemachine = stepFactor.map(n => n * distance);
    if (!scrollOngoing)
      doScroll(el);
  },
  repeat: "lowestWins",
  preventable: true
};