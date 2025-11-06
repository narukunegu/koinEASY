<script setup lang="ts">
import { ref, onMounted } from "vue";
import { NSelect } from "naive-ui";
import { useColorMode } from "@vueuse/core";

import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();
const mode = useColorMode();
const current = ref<string>();
const options = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Auto", value: "auto" },
];

function handleThemeChange(theme: "light" | "dark" | "auto") {
  mode.value = theme;
  current.value = theme;
  settingsStore.setSetting<string>("theme", theme);
}

onMounted(async () => {
  current.value = await settingsStore.getSetting("theme");
});
</script>

<template>
  <NSelect
    style="width: 100px"
    :value="current"
    :options="options"
    @update:value="handleThemeChange"
  />
</template>
