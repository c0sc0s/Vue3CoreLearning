import { ShapeFlags } from "../shared/shapeFlags";
export function initSlots(instance, children) {
  const { shapeFlag } = instance.vnode;
  if (shapeFlag & ShapeFlags.SLOT_CHILDREN)
    normalizeObjectSlots(children, instance.slots);
}

function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
