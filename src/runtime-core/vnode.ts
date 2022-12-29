import { getShapeFlag } from "../shared/shapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type, props?, children?) {
  const vnode = {
    name: "vnode",
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type, children),
  };
  return vnode;
}

export function createTextVNode(value) {
  return createVNode(Text, {}, value);
}
