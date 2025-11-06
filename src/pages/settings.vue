<script setup lang="ts">
import { NDivider } from "naive-ui";
import ThemeSwitch from "@/components/ThemeSwitch.vue";
</script>

<template>
  <div class="container mx-auto">
    <div class="space-y-1 p-10">
      <h2 class="text-2xl font-bold tracking-tight">Settings</h2>
      <p class="text-xl text-muted-foreground">
        Manage the app settings and preferences here.
      </p>
    </div>
    <NDivider class="my-6" />
    <div class="space-y-8 pl-10">
      <div class="flex items-center space-x-2">
        <h2>Theme</h2>
        <ThemeSwitch />
      </div>
    </div>
  </div>
</template>
