<script setup lang="ts">
import { NDivider } from "naive-ui";
</script>

<template>
  <div class="container mx-auto">
    <div class="space-y-1 p-10">
      <h2 class="text-2xl font-bold tracking-tight">About</h2>
      <p class="text-xl text-muted-foreground">
        KoinEASY is is a friendly, simple Koine Greek learning helper. It's free
        and open source.
      </p>
    </div>
    <NDivider />
    <div class="text-xl space-y-8 pl-10">
      <p class="text-muted-foreground">
        Written by Ian 'Jos' Nguyen, a member of Major Seminary of Saint Joseph
        - Saigon, with the love of God.
      </p>
      <p class="text-muted-foreground">
        A big thanks to all the people who have provided suggestions, bug
        reports and donations.
      </p>
    </div>
  </div>
</template>
