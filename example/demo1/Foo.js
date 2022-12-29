import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js"

export const Foo = {
  name: "Foo",
  setup() {
    const ins = getCurrentInstance();
    console.log("foo", ins);
  },
  render() {

    return h("div", {}, "foo")
  }
}