export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasNoChanged = (oldVal, newVal) => {
  return Object.is(oldVal, newVal);
};

export const hasOwn = (setupSate: any, key: any) =>
  Object.prototype.hasOwnProperty.call(setupSate, key);

export const capitalize = (s: string) =>
  s.charAt(0).toLocaleUpperCase() + s.slice(1);

export const toHandlerKey = (s: string) => (s ? "on" + s : "");

export const camelize = (s: string) => {
  return s.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
