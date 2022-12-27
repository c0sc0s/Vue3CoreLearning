import { track, trigger } from "./effect";
import { reactive, readonly, ReactiveFlags } from "./reactive";
import { isObject } from "../shared/index";

function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }

    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    if (isObject(res) && !isShallow) {
      return isReadonly ? readonly(res) : reactive(res);
    }

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

const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);
const readOnlySet = function () {
  console.warn("ReadOnly property, can not be set");
  return true;
};
const shallowMutableHandlerGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);

export const mutableHandler = {
  get,
  set,
};

export const readonlyHandler = {
  get: readOnlyGet,
  set: readOnlySet,
};

export const shallowMutableHandler = {
  get: shallowMutableHandlerGet,
  set: set,
};

export const shallowReadonlyHandler = {
  get: shallowReadonlyGet,
  set: readOnlySet,
};
