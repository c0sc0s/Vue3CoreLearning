//define ShapeFlags
export const enum ShapeFlags {
  ELEMENT = 1, //00001  UI
  STATEFUL_COMPONENT = 1 << 1, //00010 Component
  TEXT_CHILDREN = 1 << 2, //00100  Text Children
  ARRAY_CHILDREN = 1 << 3, //01000  VNodeArray Children
  SLOT_CHILDREN = 1 << 4, //10000 Slot Children
}

//get ShapeFlag
export function getShapeFlag(type, children) {
  let flag;
  flag =
    typeof type === "string"
      ? ShapeFlags.ELEMENT
      : ShapeFlags.STATEFUL_COMPONENT;
  flag = getChildrenShapeFlag(flag, children);
  return flag;
}

const getChildrenShapeFlag = (flag, children) => {
  if (typeof children === "string") {
    flag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    flag |= ShapeFlags.ARRAY_CHILDREN;
  }

  if (flag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      flag |= ShapeFlags.SLOT_CHILDREN;
    }
  }
  return flag;
};
