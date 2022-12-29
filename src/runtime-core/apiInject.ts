import { getCurrentInstance } from "./component";
export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const { provides } = currentInstance;
    provides[key] = value;
  }
}

export function inject(key, def) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const { parent } = currentInstance;
    const parentProvides = parent.provides;

    return key in parentProvides
      ? parentProvides[key]
      : typeof def === "function"
      ? def()
      : def;
  }
}
