import { createApp } from "../../lib/guide-mini-vue.esm.js"
import { App } from "./App.js"

const appContainer = document.querySelector("#app");

const app = createApp(App)

app.mount(appContainer);


