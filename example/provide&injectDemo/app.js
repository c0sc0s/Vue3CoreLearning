import { h, provide, inject } from "../../lib/guide-mini-vue.esm.js"

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal");
    provide("bar", "barVal");
  },
  render() {
    return h("div", {}, [h("p", {}, "Provider"), h(Provider2)])
  }
}

const Provider2 = {
  name: "Provider2",
  setup() {
    const foo = inject("foo");
    provide("foo", "fooVal2");
    const baz = inject("baz", () => 2);
    return {
      baz,
      foo
    }
  },
  render() {
    return h("div", {}, [h("p", {}, `p2:${this.foo},def:${this.baz}`), h(Consumer)])
  }
}



const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");

    return {
      foo, bar
    }
  },
  render() {
    return h("div", {}, `Consumer: - ${this.foo} - ${this.bar}`)
  }
}

export default {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "apiInject"), h(Provider)])
  }
}