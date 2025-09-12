<script setup lang="ts">
import { ConfigProvider } from "reka-ui";
import AppSidebar from "@/components/AppSidebar.vue";
import AppTopbar from "@/components/AppTopbar.vue";
import { TooltipProvider } from "@/components/ui/tooltip";
</script>

<template>
  <ConfigProvider>
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
  </ConfigProvider>
</template>

<style scoped>
body {
  font-family: "Gentium", sans-serif;
}
</style>
