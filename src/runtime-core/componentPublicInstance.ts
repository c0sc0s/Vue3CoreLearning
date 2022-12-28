const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const publicGetter = publicPropertiesMap[key];
    if (key in publicPropertiesMap) {
      return publicGetter(instance);
    }

    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }
  },
};
