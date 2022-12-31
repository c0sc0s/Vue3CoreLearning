import { effect } from "../reactivity/effect";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    remove: hostRemove,
    setElementText: hostSetElementText,
    insert: hostInsert,
  } = options;

  function render(vnode, container) {
    //patch
    patch(null, vnode, container, null, null);
  }

  function patch(preVnode, vnode, container, parentComponent, anchor) {
    const { type, shapeFlag } = vnode;

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent, anchor);
        break;
      case Text:
        processText(preVnode, vnode, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(preVnode, vnode, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(preVnode, vnode, container, parentComponent, anchor);
        }
    }
  }

  function processComponent(
    preVnode: any,
    vnode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountComponent(vnode, container, parentComponent, anchor);
  }

  function mountComponent(
    initialVNode: any,
    container,
    parentComponent,
    anchor
  ) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setupComponent(instance);

    setupRendereEffect(instance, container, anchor);
  }

  function setupRendereEffect(instance: any, container, anchor) {
    effect(() => {
      const subTree = getSubTree(instance);
      const preSubTree = instance.subTree;
      instance.subTree = subTree;

      if (!instance.isMounted) {
        //init patch
        patch(null, subTree, container, instance, anchor);

        // after init Mount
        finishInitMounted(instance, subTree);
      } else {
        //update patch
        patch(preSubTree, subTree, container, instance, anchor);
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
    parentComponent,
    anchor
  ) {
    if (!preVnode) {
      mountElement(vnode, container, parentComponent, anchor);
    } else {
      patchElement(preVnode, vnode, container, parentComponent, anchor);
    }
  }

  function patchElement(preVnode, vnode, container, parentComponent, anchor) {
    console.log("pre:", preVnode);
    console.log("cur:", vnode);

    const oldProps = preVnode.props || {};
    const newProps = vnode.props || {};

    const el = (vnode.el = preVnode.el);

    patchChildren(preVnode, vnode, el, parentComponent, anchor);
    patchProps(el, oldProps, newProps);
  }

  function patchChildren(
    preVnode,
    nextVnode,
    container,
    parentComponent,
    anchor
  ) {
    const preShapeFlag = preVnode.shapeFlag;
    const nextShapeFlag = nextVnode.shapeFlag;
    const preVnodeChildren = preVnode.children;
    const nextVnodeChildren = nextVnode.children;

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // array -> text
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN)
        unmountChildren(preVnode.children);
      // text -> text
      if (nextVnodeChildren !== preVnodeChildren)
        hostSetElementText(container, nextVnodeChildren);
    } else {
      //text -> array
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(nextVnodeChildren, container, parentComponent, anchor);
      }
      //array -> array
      else {
        patchKeyedChildren(
          preVnodeChildren,
          nextVnodeChildren,
          container,
          parentComponent,
          anchor
        );
      }
    }
  }

  function patchKeyedChildren(
    preVnodeChildren,
    nextVnodeChildren,
    container,
    parentComponent,
    parentAnchor
  ) {
    let i = 0;
    let e1 = preVnodeChildren.length - 1;
    let e2 = nextVnodeChildren.length - 1;

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = preVnodeChildren[i];
      const n2 = nextVnodeChildren[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = preVnodeChildren[e1];
      const n2 = nextVnodeChildren[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 新的比老的多，创建
    if (i > e1) {
      const nextPos = e2 + 1;
      const anchor =
        nextPos < nextVnodeChildren.length
          ? nextVnodeChildren[nextPos].el
          : null;
      while (i <= e2) {
        patch(null, nextVnodeChildren[i], container, parentComponent, anchor);
        i++;
      }
    }
    // 老的比新的多，删除
    else if (i > e2) {
      while (i <= e1) {
        hostRemove(preVnodeChildren[i].el);
        i++;
      }
    }
    // 中间对比
    else {
    }

    function isSameVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key;
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      hostRemove(el);
    }
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

  function mountElement(vnode, container, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type));

    //children
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor);
    }

    //props
    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      hostPatchProp(el, key, null, val);
    }

    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function processFragment(
    vnode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(vnode.children, container, parentComponent, anchor);
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
