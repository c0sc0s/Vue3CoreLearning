import { mutableHandler, readonlyHandler } from "./baseHandler";

function createReactiveObject(raw, readonly) {
  return readonly
    ? new Proxy(raw, readonlyHandler)
    : new Proxy(raw, mutableHandler);
}

export function reactive(raw: any): any {
  return createReactiveObject(raw, false);
}

export function readonly(raw: any) {
  return createReactiveObject(raw, true);
}
