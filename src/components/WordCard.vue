<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from "vue";
import { romanizeKoine } from "@/lib/romanize.ts";
import normalizeGreek from "@/lib/normalize.ts";

const { content } = defineProps(["content"]);
const showHint = defineModel("showHint");

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

function handleMouseover(event: MouseEvent) {
  event.target.title = showHint.value
    ? romanizeKoine(event.target.dataset.word || "")
    : "";
}
</script>

<template>
  <div class="text-xl" @mouseover="handleMouseover" v-html="filter" />
</template>

<style>
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
ul {
  margin-top: 0;
  list-style: disc;
  cursor: text;
  -webkit-user-select: text;
}
</style>
