import { mutableHandler, readonlyHandler } from "./baseHandler";

export function reactive(raw: object): any {
  return new Proxy(raw, mutableHandler);
}

export function readonly(target: any) {
  return new Proxy(target, readonlyHandler);
}
