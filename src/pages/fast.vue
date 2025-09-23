<script setup lang="ts">
import { NButton, NSwitch, NVirtualList, NCard, NSkeleton } from "naive-ui";
import { ref } from "vue";

import GreekInput from "@/components/GreekInput.vue";
import WordCard from "@/components/WordCard.vue";

import { analyzeWord, parseWordList } from "@/lib/data";

// Reactive state for the input and keyboard modifiers
const text = ref("");
const wordList = ref<any[]>([]);
const isAnalyzing = ref(false);
const showHint = ref(false);

async function handleOnTypeAnalyze() {
  const newSet = parseWordList(text.value);
  isAnalyzing.value = true;
  for (let i = 0; i < newSet.length; i++) {
    if (!wordList.value.find((w) => w.query === newSet[i])) {
      wordList.value.unshift({
        query: newSet[i],
        isAnalyzing: true,
      });
      const req = await analyzeWord(newSet[i]);
      wordList.value[0] = {
        query: newSet[i],
        result: req,
        isAnalyzing: false,
      };
    }
  }
  isAnalyzing.value = false;
}
</script>

<template>
  <div class="flex min-h-screen">
    <div id="app" class="w-2/3 m-5">
      <!-- Textarea for output -->
      <GreekInput
        v-model:text-model="text"
        :auto-hide="false"
        input-style="h-[30vh] p-4 text-2xl"
        input-placeholder="Press [Space] or [Enter] to analyze on typing..."
        :show-footer="false"
        @on-entered="handleOnTypeAnalyze"
        @on-spaced="handleOnTypeAnalyze"
      />
    </div>
    <!-- Result list -->
    <div class="w-1/3 h-[88vh] text-xl m-1 rounded-lg">
      <div class="flex justify-between items-center mr-2 my-2">
        <NButton size="small" round type="primary" @click="wordList = []">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"
            />
          </svg>
        </NButton>
        <NSwitch v-model:value="showHint" size="large">
          <template #checked> Show Romans </template>
          <template #unchecked> Hide Romans </template>
        </NSwitch>
      </div>
      <NVirtualList :item-size="30" :items="wordList" item-resizable>
        <template #default="{ item }">
          <NCard
            :key="item.query"
            :title="item.query"
            :segmented="{ content: true }"
            class="mb-2"
            header-style="font-size: 22px; text-align: center;"
            size="medium"
            hoverable
          >
            <NSkeleton v-if="item.isAnalyzing" text :repeat="3" />
            <WordCard v-else v-model:show-hint="showHint" :content="item" />
          </NCard>
        </template>
      </NVirtualList>
    </div>
  </div>
</template>
