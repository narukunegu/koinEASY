<script setup lang="ts">
import { NSwitch, NSpin, NVirtualList } from "naive-ui";
import { onMounted, ref, useTemplateRef } from "vue";

import KeyboardComponent from "@/components/KeyboardComponent.vue";
import WordCard from "@/components/WordCard.vue";

import { getWord } from "@/lib/db.ts";
import normalizeGreek from "@/lib/normalize.ts";

// Reactive state for the input and keyboard modifiers
const text = ref("");
const outputChar = ref("");
const currentDiac = ref<string[]>([]);
const textArea = useTemplateRef("textArea");
const selectionStart = ref(0);
const selectionEnd = ref(0);
const prefix = ref<string>("");
const suffix = ref<string>("");
const pos = ref(0);
const wordList = ref<any[]>([]);
const isAnalyzing = ref(false);
const showHint = ref(false);

async function processText() {
  if (
    selectionStart.value < selectionEnd.value &&
    normalizeGreek(outputChar.value) !==
      normalizeGreek(text.value[selectionStart.value] as string)
  ) {
    prefix.value = text.value.substring(0, selectionStart.value + 1);
    pos.value = prefix.value.length + 1;
  } else {
    prefix.value = text.value.substring(0, selectionStart.value);
    pos.value = prefix.value.length + 1;
  }
  suffix.value = text.value.substring(selectionEnd.value, text.value.length);
  text.value = prefix.value + outputChar.value + suffix.value;
}

function handleOnTypeAnalyze() {
  const newSet = [...new Set(text.value.split(" "))].filter(
    (item) => ![" ", "", "\n"].includes(item),
  );
  newSet.forEach(async (word, ind) => {
    if (
      !wordList.value[ind] ||
      normalizeGreek(newSet[ind]) !== wordList.value[ind].query
    ) {
      isAnalyzing.value = true;
      const req = await getWord(normalizeGreek(word));
      wordList.value[ind] = {
        index: ind,
        query: normalizeGreek(word),
        result: req,
      };
      isAnalyzing.value = false;
    }
  });
}

async function handleOnType() {
  textArea.value!.focus();
  await processText();
  if ([" ", "\n"].includes(outputChar.value)) {
    handleOnTypeAnalyze();
  }
  textArea.value!.select();
  if (currentDiac.value.length > 0) {
    textArea.value!.setSelectionRange(pos.value - 1, pos.value);
  } else {
    textArea.value!.setSelectionRange(pos.value, pos.value);
  }
}

onMounted(() => {
  textArea.value!.addEventListener("selectionchange", () => {
    selectionStart.value = Math.min(
      textArea.value!.selectionStart,
      textArea.value!.selectionEnd,
    );
    selectionEnd.value = Math.max(
      textArea.value!.selectionStart,
      textArea.value!.selectionEnd,
    );
  });
});
</script>

<template>
  <div class="bg-background flex h-full min-h-screen">
    <div
      id="app"
      class="w-2/3 m-1 p-4 rounded-lg border-2 border-border h-[94vh]"
    >
      <!-- Textarea for output -->
      <textarea
        ref="textArea"
        v-model="text"
        :disabled="isAnalyzing"
        class="w-full h-[30vh] bg-secondary p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-2xl resize-none mb-6"
        placeholder="Type [Space] or [Enter] to analyze on typing..."
      />
      <!-- Keyboard component -->
      <KeyboardComponent
        v-model:output="outputChar"
        v-model:buffer="currentDiac"
        @on-typed="handleOnType"
      />
    </div>
    <!-- Result list -->
    <div class="w-1/3 h-[88vh] text-xl m-1 rounded-lg">
      <NSwitch v-model:value="showHint" class="my-2" size="large">
        <template #checked> Show Romans </template>
        <template #unchecked> Hide Romans </template>
      </NSwitch>
      <NVirtualList
        v-if="!isAnalyzing"
        :item-size="60"
        :items="wordList"
        item-resizable
      >
        <template #default="{ item }">
          <WordCard
            :key="item.index"
            v-model:show-hint="showHint"
            :content="item"
          />
        </template>
      </NVirtualList>
      <NSpin :show="isAnalyzing" size="medium">...</NSpin>
    </div>
  </div>
</template>
