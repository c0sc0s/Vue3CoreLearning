import { hasOwn } from "../shared";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
};

//this.$el --> container
//this.$el

//this.msg

//data(){return{}}
//instance.proxt -> Proxy({_:instance},handler)

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const publicGetter = publicPropertiesMap[key];
    if (key in publicPropertiesMap) {
      return publicGetter(instance);
    }

    //this.msg
    const { setupState, props } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
  },
};
