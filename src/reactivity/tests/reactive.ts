//Vue3 reactive

export function reactive(raw, key) {
  return new Proxy(raw, {
    get(raw, key) {
      //const res = raw.key
      const res = Reflect.get(raw, key);

      //收集依赖
      // track();

      return res;
    },
    set(raw, key, newVal) {
      Reflect.set(raw, key, newVal);

      //TODO: 触发依赖
      // trigger();

      return newVal;
    },
  });
}
