import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert,
  } = options;

  function render(vnode, container, parentComponent) {
    //patch
    patch(null, vnode, container, parentComponent);
  }

  function patch(preVnode, vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode;

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent);
        break;
      case Text:
        processText(preVnode, vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(preVnode, vnode, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(preVnode, vnode, container, parentComponent);
        }
    }
  }

  function processComponent(
    preVnode: any,
    vnode: any,
    container: any,
    parentComponent
  ) {
    mountComponent(vnode, container, parentComponent);
  }
  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setupComponent(instance);

    setupRendereEffect(instance, container);
  }

  function setupRendereEffect(instance: any, container) {
    effect(() => {
      const subTree = getSubTree(instance);
      const preSubTree = instance.subTree;
      instance.subTree = subTree;

      if (!instance.isMounted) {
        //init patch
        patch(null, subTree, container, instance);

        // after init Mount
        finishInitMounted(instance, subTree);
      } else {
        //update patch
        patch(preSubTree, subTree, container, instance);
      }
    });
  }

  function getSubTree(instance) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    return subTree;
  }

  function finishInitMounted(instance, subTree) {
    instance.vnode.el = subTree.el;
    instance.isMounted = true;
  }

  function processElement(
    preVnode: any,
    vnode: any,
    container: any,
    parentComponent
  ) {
    if (!preVnode) {
      mountElement(vnode, container, parentComponent);
    } else {
      console.log("update");
      patchElement(preVnode, vnode, container);
    }
  }

  function patchElement(preVnode, vnode, container) {
    console.log("pre:", preVnode);
    console.log("cur:", vnode);

    const oldProps = preVnode.props || {};
    const newProps = vnode.props || {};

    const el = (vnode.el = preVnode.el);

    patchProps(el, oldProps, newProps);
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps === newProps) return;
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];

      if (prevProp !== nextProp) {
        hostPatchProp(el, key, prevProp, nextProp);
      }
    }

    if (!oldProps) return;
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  }

  function mountElement(vnode, container, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type));

    //children
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent);
    }

    //props
    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }

    insert(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode, container, parentComponent);
  }
  function processText(preVnode, vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  return {
    createApp: createAppAPI(render),
  };
}
