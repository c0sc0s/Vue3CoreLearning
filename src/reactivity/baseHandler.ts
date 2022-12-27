import { track, trigger } from "./effect";

function createGetter(isReadonly = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}

export const mutableHandler = {
  get: createGetter(),
  set: createSetter(),
};

export const readonlyHandler = {
  get: createGetter(true),
  set() {
    return true;
  },
};
