<script setup lang="ts">
import { ref, watch } from "vue";
import AppSidebar from "@/components/AppSidebar.vue";
import AppTopbar from "@/components/AppTopbar.vue";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NConfigProvider, darkTheme } from "naive-ui";
import { useColorMode } from "@vueuse/core";

const color = useColorMode();
const theme = ref(color.value);
watch(color, () => {
  theme.value = color.value;
});
</script>

<template>
  <NConfigProvider :theme="theme === 'dark' ? darkTheme : null">
    <body class="h-full">
      <AppTopbar />
      <TooltipProvider>
        <main class="flex">
          <AppSidebar />
          <section class="bg-background grow">
            <router-view />
          </section>
        </main>
      </TooltipProvider>
    </body>
  </NConfigProvider>
</template>

<style>
:root {
  font-family: GentiumW, sans-serif;
}
span.lemma {
  font-weight: bold;
}
span.tr-lang {
  color: white;
  background: rgb(78, 89, 166);
  font-weight: bold;
  padding-left: 0.2em;
  padding-right: 0.2em;
}
span.gramm {
  color: darkgreen;
}
</style>
