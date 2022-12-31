import { ref, h } from "../../../lib/guide-mini-vue.esm.js";

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C")
];

const nextChildren = [
  h("p", { key: "D" }, "D"),
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "E" }, "E"),
]

export default {
  name: "ArrayToArray",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;

    return {
      isChange
    }
  },
  render() {
    return this.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren)
  }
}
