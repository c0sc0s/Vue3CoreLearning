import { h } from "../../lib/guide-mini-vue.esm.js"
export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log("Foo: emit add");
      emit("add-foo", 2, 3);
    }

    return {
      emitAdd
    }
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd
      },
      "emitAdd"
    )

    const foo = h("p", {}, "foo:" + this.count);

    return h("div", {}, [foo, btn]);
  }
}