import { createRenderer } from "../runtime-core/index";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, preVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) el.removeAttribute(key);
    else el.setAttribute(key, nextVal);
  }
}

function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function insert(child, parent, anchor?) {
  parent.insertBefore(child, anchor || null);
}

function setElementText(container, nextVnodeChildren) {
  container.textContent = nextVnodeChildren;
}

const render = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export const createApp = render.createApp;
