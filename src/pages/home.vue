<script setup lang="ts">
import { NSwitch, NVirtualList, NCard, NSkeleton } from "naive-ui";
import { ref } from "vue";

import GreekInput from "@/components/GreekInput.vue";
import WordCard from "@/components/WordCard.vue";

import { getWord } from "@/lib/dbDict";

// Reactive state for the input and keyboard modifiers
const text = ref("");
const wordList = ref<any[]>([]);
const isAnalyzing = ref(false);
const showHint = ref(false);

async function handleOnTypeAnalyze() {
  const newSet = [...new Set(text.value.split(/[,.\s]+/))].filter(
    (item) => ![" ", "", "\n"].includes(item),
  );
  const listLength = newSet.length;
  newSet.forEach(async (word, ind) => {
    const fWord = wordList.value.find((w) => w?.query === word);
    if (fWord) {
      wordList.value[listLength - ind - 1] = { ...fWord };
    } else {
      isAnalyzing.value = true;
      wordList.value[listLength - ind - 1] = {
        query: word,
        isAnalyzing: true,
      };
      const req = await getWord(word);
      wordList.value[listLength - ind - 1] = {
        query: word,
        result: req,
        isAnalyzing: false,
      };
      isAnalyzing.value = false;
    }
  });
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
      <div class="flex justify-end items-center mr-2 my-2">
        <NSwitch v-model:value="showHint" size="large">
          <template #checked>Show Romans</template>
          <template #unchecked>Hide Romans</template>
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
