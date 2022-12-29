import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
  };

  component.emit = emit as any;

  return component;
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
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

function finishComponentSetup(instance: any) {
  const Component = instance.type;

  instance.render = Component.render;
}
