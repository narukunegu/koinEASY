<script setup lang="ts">
import { computed } from "vue";
import { romanizeKoine } from "@/lib/helpers";

const { content } = defineProps(["content"]);

const filter = computed(() => {
  let text = "";
  content.result.forEach((word: string) => {
    let res = word;
    res = res.replace(/k="/g, `data-word="`);
    res = res.replace(
      `"lemma"`,
      `"lemma" data-word="${res.substring(res.indexOf(`"lemma"`) + 8, res.indexOf(`</span>`))}"`,
    );
    text += res;
  });
  return text;
});
</script>

<template>
  <div class="word-card text-xl" v-html="filter" />
</template>

<style>
.word-card ul {
  margin-top: 0;
  list-style: disc;
  cursor: text;
  user-select: text;
}
</style>
