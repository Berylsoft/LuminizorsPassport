import "core-js";
import "blob.js";
import "fast-text-encoding";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import { router } from "./router";

import "./app.scss";
import "./assets/iconfont/iconfont.css";

const pinia = createPinia().use(piniaPluginPersistedstate);
const App = createApp({}).use(pinia).use(router);
App.config.errorHandler = console.error;

export default App;
