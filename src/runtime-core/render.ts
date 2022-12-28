import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  //patch
  patch(vnode, container);
}

function patch(vnode, container) {
  if (typeof vnode.type === "string") {
    //process Element

    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    //process components

    processComponent(vnode, container);
  }
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}
function mountComponent(vnode: any, container) {
  //根据vnode -> 创建组件实例对象
  const instance = createComponentInstance(vnode);
  setupComponent(instance);

  setupRendereEffect(instance, container);
}

function setupRendereEffect(instance: any, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  //vnode -> patch
  //vnode -> element -> mountElement
  patch(subTree, container);

  instance.vnode.el = subTree.el;
}

function processElement(vnode: any, container: any) {
  //init
  mountElement(vnode, container);

  //update
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.type);
  vnode.el = el;
  const { children } = vnode;

  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    //vnode
    mountChildren(vnode, el);
  }

  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  container.appendChild(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}
