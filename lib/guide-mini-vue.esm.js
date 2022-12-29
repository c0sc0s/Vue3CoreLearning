const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasOwn = (setupSate, key) => Object.prototype.hasOwnProperty.call(setupSate, key);
const capitalize = (s) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
const toHandlerKey = (s) => (s ? "on" + s : "");
const camelize = (s) => {
    return s.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};

let targetMap = new Map();
function track(target, key) {
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
}
function runEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
//trigger
function trigger(target, key) {
    let dep = targetMap.get(target).get(key);
    runEffects(dep);
}

function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "__v_isReadOnly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isObject(res) && !isShallow) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);
const readOnlySet = function (target, key, val) {
    console.warn(`${key} is ReadOnly property, can not be set`);
    return true;
};
const shallowMutableHandlerGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: readOnlyGet,
    set: readOnlySet,
};
const shallowMutableHandler = {
    get: shallowMutableHandlerGet,
    set: set,
};
const shallowReadonlyHandler = {
    get: shallowReadonlyGet,
    set: readOnlySet,
};

//1.响应式数据分类:
function createReactiveObject(raw, readonly = false, shallow = false) {
    if (!isObject(raw)) {
        console.warn(`${raw} 必须是一个对象`);
        return raw;
    }
    if (shallow) {
        return readonly
            ? new Proxy(raw, shallowReadonlyHandler)
            : new Proxy(raw, shallowMutableHandler);
    }
    return readonly
        ? new Proxy(raw, readonlyHandler)
        : new Proxy(raw, mutableHandler);
}
function reactive(raw) {
    return createReactiveObject(raw);
}
function readonly(raw) {
    return createReactiveObject(raw, true);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, true, true);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handlerName = camelize(toHandlerKey(capitalize(event)));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
//this.$el --> container
//this.$el
//this.msg
//data(){return{}}
//instance.proxt -> Proxy({_:instance},handler)
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const publicGetter = publicPropertiesMap[key];
        if (key in publicPropertiesMap) {
            return publicGetter(instance);
        }
        //this.msg
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
    };
    component.emit = emit;
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit.bind(null, instance),
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === "object") {
        //注入
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    //patch
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRendereEffect(instance, container);
}
function setupRendereEffect(instance, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}
function processElement(vnode, container) {
    //init
    mountElement(vnode, container);
    //update
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    //children
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    //props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.appendChild(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        name: "vnode",
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    //Children ShapesFlag
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            //obj -> vnode
            const vnode = createVNode(rootComponent);
            //vnode -> render -> dom
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
