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
//track: 该函数用于将activeEffect添加到某个成员对应的依赖Set中
//这里有两个数据解构:
//1. targetMap  --> 键: 对象 值: depsMap(该对象的依赖集合)
//2. depsMap = targetMap.get(target) --> 键: 属性名 值: 该属性对应的一系列依赖(函数)
//流程：
//effect -> reactiveEffect -> run
//--> get -> track
//-> targetMap(键: target, 值:depsMap)
//-> depsMap(键: key, 值: 依赖set)
//-> 将activeEffect add入set,完成依赖收集
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

//trigger: 该函数是为了触发依赖
// 根据target和key得到对应的依赖set
// 遍历set，如果effect有 scheduler则执行scheduler，否则调用run()
// 每次修改响应式数据，被set拦截，调用trigger,触发依赖
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

//effect(fn:Function, options?:): 该函数是为了收集函数中用到的依赖
//1.执行一次fn
//2.在执行该函数的过程中，可能会访问到一些响应式数据(之前被reactive处理的), 则会通过 track 将此函数标记为依赖该响应式数据
//3.每次修改函数依赖的响应式数据时候，就调用该函数
//scheduler
//1.调用effect,不执行
//2.如果有scheduler, 依赖的数据发生变化时，不会执行 fn(run), 而是执行 scheduler
//返回值: run
interface effectOptions {
  scheduler: Function;
}
export function effect(fn: Function, options?: effectOptions) {
  const _scheduler = options && options.scheduler;
  const _effect = new ReactiveEffect(fn, _scheduler);
  _effect.run();

  return _effect.run.bind(_effect);
}
