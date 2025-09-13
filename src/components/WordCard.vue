<script setup lang="ts">
import { computed } from "vue";
import { Separator } from "@/components/ui/separator";

const { content } = defineProps(["content"]);

const filter = computed(() => {
  let text = "";
  content.result.forEach((word: any) => {
    const meaning = word.m || "";
    let start = meaning.indexOf(
      `<li class="morph-grc-li" k="${content.query}"`,
    );
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
    text += `<div class="mb-2">${meaning.substring(0, meaning.indexOf("<ul>"))}<ul class="pl-10">${res}</ul></div>`;
  });
  return text;
});
</script>

<template>
  <div
    class="bg-secondary block rounded-xl border-1 dark:border-foreground hover:border-blue-500 m-2 px-4 py-2"
  >
    <div class="text-center text-2xl">{{ content.query }}</div>
    <Separator class="bg-foreground my-1" />
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
  cursor: text;
  -webkit-user-select: text;
}
</style>
