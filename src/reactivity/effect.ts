import { extend } from "../shared/index";

export class ReactiveEffect {
  private _fn: Function;
  public onStop: Function | undefined;

  constructor(fn: Function, public scheduler?) {
    this._fn = fn;
    this.scheduler = scheduler;
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
  effect.deps.length = 0;
}

//track
let activeEffect: ReactiveEffect;
let targetMap = new Map();

function shouldTrack() {
  return activeEffect && !activeEffect.active;
}

export function trackEffects(dep) {
  if (activeEffect && !dep.has(activeEffect)) {
    activeEffect.deps.push(dep);
    dep.add(activeEffect);
  }
}

export function track(target: object, key: any) {
  if (shouldTrack()) return;

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

  trackEffects(dep);
}

export function runEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

//trigger
export function trigger(target: object, key: any) {
  let dep = targetMap.get(target).get(key);
  runEffects(dep);
}

//effect
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

//stop
export function stop(runner) {
  runner.effect.stop();
}
