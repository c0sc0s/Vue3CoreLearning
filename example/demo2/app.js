import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
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
      [
        h(
          "button",
          {
            class: "red",
            onClick() {
              alert("hello mini-vue");
            }
          },
          "hello"
        ),
        h(
          "div",
          { class: "blue" },
          this.msg
        ),
        h(Foo, {
          count: 100,
          onAddFoo(...e) {
            console.log(...e, "onAddFoo");
          }
        })
      ]
    )
  },

  setup() {
    return {
      msg: "mini-vue",
    }
  }
}