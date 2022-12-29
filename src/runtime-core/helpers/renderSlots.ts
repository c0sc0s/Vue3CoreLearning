import { createVNode, Fragment } from "./../vnode";

export function renderSlots(slots, name, props) {
  const slot = slots[name];

  return slot && createVNode(Fragment, {}, slot(props));
}
