export let domManager = {
  addChild(parentIdentifier, childContent, position) {
      let positions = {
          beforebegin: "beforebegin",
          first: "afterbegin",
          last: "beforeend",
          after: "afterend"
      };
    const parent = document.querySelector(parentIdentifier);
    if (parent) {
      parent.insertAdjacentHTML(positions[position], childContent);
    } else {
      console.error("could not find such html element: " + parentIdentifier);
    }
  },
  addEventListener(parentIdentifier, eventType, eventHandler) {
    const parent = document.querySelector(parentIdentifier);
    if (parent) {
      parent.addEventListener(eventType, eventHandler);
    } else {
      console.error("could not find such html element: " + parentIdentifier);
    }
  },
};
