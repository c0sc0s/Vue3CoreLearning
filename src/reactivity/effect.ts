class ReactiveEffect {
  private _fn: Function;
  public scheduler: Function;

  constructor(fn, scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    activeEffect = this;
    return this._fn();
  }
}

const targetMap = new Map();
export function track(target, key) {
  //target.key -> dep
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  //dep存储依赖(fn)
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  dep.add(activeEffect);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);

  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

interface options {
  scheduler: Function;
}
let activeEffect;
export function effect(fn, options?: options) {
  //fn
  const scheduler = options && options.scheduler;
  const _effect = new ReactiveEffect(fn, scheduler);

  _effect.run();

  return _effect.run.bind(_effect);
}
