export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasNoChanged = (oldVal, newVal) => {
  return Object.is(oldVal, newVal);
};

export const hasOwn = (setupSate: any, key: any) =>
  Object.prototype.hasOwnProperty.call(setupSate, key);
