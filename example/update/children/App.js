import { h } from "../../../lib/guide-mini-vue.esm.js";

// import ArrayToText from "./ArrayToText.js";
// import ArrayToArray from ".ArrayToArray.js";
import TextToArray from "./TextToArray.js";
// import TextToText from "./TextToText.js";

export default {
  name: "App",
  render() {
    return h("div", { tId: 1 },
      [
        h("p", {}, "主页"),
        // h(ArrayToText),
        // h(TextToText),
        h(TextToArray)
      ]
    )
  }
}