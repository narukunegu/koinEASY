<script setup lang="ts">
import { NButton, NCard, NSkeleton } from "naive-ui";
import { computed, ref } from "vue";

import InputComponent from "@/components/InputComponent.vue";

import { parseDict, parseWordList } from "@/lib/words";

// Reactive state for the input and keyboard modifiers
const text = ref("");
const wordList = ref<any[]>([]);
const computedList = computed(() => {
  return wordList.value.slice(0, 19);
});

async function handleOnTypeAnalyze() {
  const newSet = parseWordList(text.value);
  for (let i = 0; i < newSet.length; i++) {
    if (!wordList.value.find((w) => w.query === newSet[i])) {
      wordList.value.unshift({
        query: newSet[i],
        isAnalyzing: true,
      });
      const req = await parseDict(newSet[i]);
      if (req.length === 0) {
        req.push({ content: "<i>No result.</i>" });
      }
      wordList.value[0] = {
        query: newSet[i],
        result: req.map((v) => v.content).join(""),
        isAnalyzing: false,
      };
    }
  }
}
</script>

<template>
  <div class="flex h-screen">
    <div class="grow m-5">
      <!-- Textarea for output -->
      <InputComponent
        v-model:output-text="text"
        input-style="h-[40vh] p-4 text-2xl"
        input-placeholder="Press [Space] or [Enter] to analyze on typing..."
        :show-footer="true"
        :command-mode="false"
        @on-entered="handleOnTypeAnalyze"
        @on-spaced="handleOnTypeAnalyze"
      />
    </div>
    <!-- Result list -->
    <div class="h-[90vh] w-[40vw] flex flex-col text-xl m-1 pr-5 rounded-lg">
      <div class="flex justify-between items-center mr-2 my-2">
        <NButton size="small" round type="primary" @click="wordList = []">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M7 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2h4a1 1 0 1 1 0 2h-1.069l-.867 12.142A2 2 0 0 1 17.069 22H6.93a2 2 0 0 1-1.995-1.858L4.07 8H3a1 1 0 0 1 0-2h4zm2 2h6V4H9zM6.074 8l.857 12H17.07l.857-12zM10 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1"
            />
          </svg>
        </NButton>
      </div>
      <div class="flex flex-col h-max-full overflow-y-scroll">
        <NCard
          v-for="item in computedList"
          :key="item.query"
          :title="item.query"
          :segmented="{ content: true }"
          class="mb-2"
          header-style="font-size: 1.25rem; text-align: center;"
          size="medium"
          hoverable
        >
          <NSkeleton v-if="item.isAnalyzing" text :repeat="3" />
          <div v-else class="text-xl" v-html="item.result" />
        </NCard>
      </div>
    </div>
  </div>
</template>
