import { isObject } from "../shared";
import {
  mutableHandler,
  readonlyHandler,
  shallowReadonlyHandler,
  shallowMutableHandler,
} from "./baseHandler";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadOnly",
}

//1.响应式数据分类:
function createReactiveObject(raw: object, readonly = false, shallow = false) {
  if (!isObject(raw)) {
    console.warn(`${raw} 必须是一个对象`);
    return raw;
  }

  if (shallow) {
    return readonly
      ? new Proxy(raw, shallowReadonlyHandler)
      : new Proxy(raw, shallowMutableHandler);
  }

  return readonly
    ? new Proxy(raw, readonlyHandler)
    : new Proxy(raw, mutableHandler);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadOnly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function reactive(raw: object): any {
  return createReactiveObject(raw);
}

export function readonly(raw: any) {
  return createReactiveObject(raw, true);
}

export function shallowReactive(raw: any) {
  return createReactiveObject(raw, false, true);
}

export function shallowReadonly(raw: any) {
  return createReactiveObject(raw, true, true);
}

export function isProxy(val) {
  return isReadOnly(val) || isReactive(val);
}
