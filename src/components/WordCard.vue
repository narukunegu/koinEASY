<script setup lang="ts">
import { computed } from "vue";

const { content } = defineProps(["content"]);

const filter = computed(() => {
  const meaning = content.result.m || "";
  let start = meaning.indexOf(`<li class="morph-grc-li" k="${content.query}"`);
  let end = meaning.indexOf(`</li>`, start);
  let res = "";
  while (start !== -1) {
    res += meaning.substring(start, end + 5);
    start = meaning.indexOf(
      `<li class="morph-grc-li" k="${content.query}"`,
      end,
    );
    end = meaning.indexOf(`</li>`, start);
  }
  res = `<div>${meaning.substring(0, meaning.indexOf("<ul>"))}<ul>${res}</ul></div>`;
  return res;
});
</script>

<template>
  <div class="block rounded-xl border-2 bg-white pt-1 pl-10 pr-5 pb-5">
    <div>{{ content.query }}</div>
    <div v-html="filter" />
  </div>
</template>

<style>
span.lemma {
  font-family: "Gentium-Bold";
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
}
</style>
