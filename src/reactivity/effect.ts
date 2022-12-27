import { extend } from "../shared";
class ReactiveEffect {
  private _fn: Function;
  public onStop: Function | undefined;
  public scheduler: Function | undefined;

  constructor(fn: Function) {
    this._fn = fn;
  }

  public active: boolean = true;
  public deps: any[] = [];

  run() {
    activeEffect = this;
    return this._fn();
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
    effect.onStop && effect.onStop();
  });
}

let targetMap = new Map();
export function track(target: object, key: any) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
  activeEffect && activeEffect.deps.push(dep);
}

export function trigger(target: object, key: any) {
  let dep = targetMap.get(target).get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

let activeEffect: ReactiveEffect;
interface effectOptions {
  scheduler?: Function;
  onStop?: Function;
}
export function effect(fn: Function, options?: effectOptions) {
  const _effect = new ReactiveEffect(fn);

  //options
  extend(_effect, options);

  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
