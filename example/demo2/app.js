import { h } from "../../lib/guide-mini-vue.esm.js"

window.self = null;

export const App = {
  render() {
    window.self = this;
    return h(
      "div", //字符串 --> 生成element节点 // Object --> 配置对象 --> Component
      {
        id: "root",
        class: ["red", "hard"],
      },
      "hi, " + this.msg)
    // [h("button", { class: "red" }, "hello"), h("div", { class: "blue" }, this.msg)])
  },
  setup() {
    return {
      msg: "mini-vue",
    }
  }
}