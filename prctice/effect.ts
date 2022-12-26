class ReactiveEffect {
  private _fn: Function;
  public scheduler: Function | undefined;

  constructor(fn: Function, scheduler?: Function | undefined) {
    this._fn = fn;
    this.scheduler = scheduler;
  }

  run() {
    activeEffect = this;
    return this._fn();
  }
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
  scheduler: Function;
}
export function effect(fn: Function, options?: effectOptions) {
  const _scheduler = options && options.scheduler;
  const _effect = new ReactiveEffect(fn, _scheduler);
  _effect.run();
}

//effect(fn:Function, options?:):

//1.执行一次fn
//2.在执行该函数的过程中，可能会访问到一些响应式数据(之前被reactive处理的), 则会通过 track 将此函数标记为依赖该响应式数据
//3.每次修改函数依赖的响应式数据时候，就调用该函数

//scheduler
//1.调用effect,不执行
//2.如果有scheduler, 依赖的数据发生变化时，不会执行 fn(run), 而是执行 scheduler
