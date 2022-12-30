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

function insert(el, parent) {
  parent.append(el);
}

const render = createRenderer({
  createElement,
  patchProp,
  insert,
});

export const createApp = render.createApp;
