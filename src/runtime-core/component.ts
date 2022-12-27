export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  };
}

export function setupComponent(instance) {
  //TODO
  //initProps();
  //initSlots();
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const Component = instance.type;

  const { setup } = Component;

  if (setup) {
    const setupResult = setup();

    handleSetupResult(instance, setupResult);
  }
}
function handleSetupResult(instance, setupResult: any) {
  //TODO function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;

  Component.render = instance.render;
}
