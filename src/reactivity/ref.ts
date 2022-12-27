import { trackEffects, runEffects } from "./effect";
import { reactive } from "./reactive";
import { hasNoChanged, isObject } from "./../shared/index";

class RefImpl {
  private _value: any;
  public dep: any;
  public _raw: any;
  public _v_isRef = true;
  constructor(value) {
    this._raw = value;
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackEffects(this.dep);
    return this._value;
  }

  set value(newValue) {
    if (hasNoChanged(this._raw, newValue)) return;
    this._raw = newValue;
    this._value = convert(newValue);
    runEffects(this.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

function convert(newValue) {
  return isObject(newValue) ? reactive(newValue) : newValue;
}

export function isRef(ref) {
  return !!ref._v_isRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      const res = Reflect.get(target, key);
      return unRef(res);
    },
    set(target, key, val) {
      let res = Reflect.get(target, key);

      if (isRef(res) && !isRef(val)) {
        return (res.value = val);
      } else {
        return Reflect.set(target, key, val);
      }
    },
  });
}
