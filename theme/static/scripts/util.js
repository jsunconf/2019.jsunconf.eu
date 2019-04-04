export const addElem = (name, attrs) =>
  document.head.appendChild(Object.assign(document.createElement(name), attrs));
