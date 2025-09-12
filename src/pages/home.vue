<script setup lang="ts">
import {
  defineAsyncComponent,
  onMounted,
  ref,
  useTemplateRef,
  watchEffect,
} from "vue";

import KeyboardComponent from "@/components/KeyboardComponent.vue";
// import WordCard from "@/components/WordCard.vue";

import { getWord } from "@/lib/db.ts";
import normalizeGreek from "@/lib/normalize.ts";

const WordCard = defineAsyncComponent(
  () => import("@/components/WordCard.vue"),
);

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

async function handleOnType() {
  textArea.value!.focus();
  await processText();
  textArea.value!.select();
  if (currentDiac.value.length > 0) {
    textArea.value!.setSelectionRange(pos.value - 1, pos.value);
  } else {
    textArea.value!.setSelectionRange(pos.value, pos.value);
  }
}

async function handleAnalyze() {
  wordList.value = [];
  text.value.split(" ").forEach(async (v, ind) => {
    isAnalyzing.value = true;
    if (v !== " ") {
      const req = await getWord(normalizeGreek(v));
      wordList.value.push({
        index: ind,
        query: normalizeGreek(v),
        result: req || "",
      });
    }
    isAnalyzing.value = false;
  });
}

watchEffect(() => {
  wordList.value.sort((a, b) => a.index - b.index);
});

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
  <div class="bg-gray-100 flex h-full">
    <div id="app" class="w-2/3 bg-white m-1 p-4 rounded-lg border-2">
      <!-- Textarea for output -->
      <textarea
        ref="textArea"
        v-model="text"
        :disabled="isAnalyzing"
        class="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-2xl resize-none mb-6"
        placeholder="Type here..."
      />

      <!-- Button -->
      <div class="text-right">
        <button
          v-if="!isAnalyzing"
          class="w-60 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline"
          @click="handleAnalyze"
        >
          Analyze
        </button>
        <button
          v-if="isAnalyzing"
          disabled
          class="w-60 py-2 px-4 text-gray-900 bg-white rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 items-center"
        >
          <svg
            aria-hidden="true"
            role="status"
            class="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="#1C64F2"
            />
          </svg>
          Analyzing...
        </button>
      </div>
      <!-- Keyboard component -->
      <KeyboardComponent
        v-model:output="outputChar"
        v-model:buffer="currentDiac"
        @on-typed="handleOnType"
      />
    </div>
    <!-- Result list -->
    <div class="w-1/3 m-1 text-xl h-[90vh] overflow-scroll p-2">
      <div v-if="isAnalyzing" class="block bg-white border-2 rounded-lg p-4">
        Analyzing...
      </div>
      <WordCard v-for="w in wordList" v-else :key="w.index" :content="w" />
    </div>
  </div>
</template>
