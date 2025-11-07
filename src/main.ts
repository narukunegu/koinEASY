import { useColorMode } from "@vueuse/core";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { useSettingsStore } from "@/stores/settings";
import App from "./App.vue";
import router from "./router";
import "./assets/css/base.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

initAppSettings();

app.mount("#app");

async function initAppSettings() {
  const settingsStore = useSettingsStore();
  const mode = useColorMode();
  // Sets the theme based on the user's settings
  const theme = (await settingsStore.getSetting<string>("theme")) as
    | "light"
    | "dark"
    | "auto";
  if (!theme) {
    mode.value = "dark";
    settingsStore.setSetting("theme", mode.value);
  } else {
    mode.value = theme;
  }

  const keyboard = (await settingsStore.getSetting("keyboard")) as boolean;
  if (keyboard === undefined) {
    settingsStore.setSetting("keyboard", true);
  }
}
