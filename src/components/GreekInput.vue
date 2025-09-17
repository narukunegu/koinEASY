<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { NSwitch } from "naive-ui";

import KeyboardComponent from "@/components/KeyboardComponent.vue";

import normalizeGreek from "@/lib/normalize.ts";

// Reactive state for the input and keyboard modifiers
const { autoHide, inputLimit, inputStyle, inputPlaceholder } = defineProps([
  "autoHide",
  "inputLimit",
  "inputStyle",
  "inputPlaceholder",
]);
const emit = defineEmits(["onEntered", "onSpaced"]);

const textModel = defineModel<string>("text-model");
const outputChar = ref("");
const currentDiac = ref<string[]>([]);
const textareaRef = useTemplateRef("textareaRef");
const selectionStart = ref(0);
const selectionEnd = ref(0);
const prefix = ref<string>("");
const suffix = ref<string>("");
const pos = ref(0);
const showKeyboard = ref(!autoHide);
const onKeyboard = ref(true);

const wordCounter = computed(() => {
  return textModel.value.split(/\s+/).filter((w) => w !== "").length;
});

async function processText() {
  if (
    selectionStart.value < selectionEnd.value &&
    normalizeGreek(outputChar.value) !==
      normalizeGreek(textModel.value[selectionStart.value] as string)
  ) {
    prefix.value = textModel.value.substring(0, selectionStart.value + 1);
    pos.value = prefix.value.length + 1;
  } else {
    prefix.value = textModel.value.substring(0, selectionStart.value);
    pos.value = prefix.value.length + 1;
  }
  suffix.value = textModel.value.substring(
    selectionEnd.value,
    textModel.value.length,
  );
  textModel.value = prefix.value + outputChar.value + suffix.value;
}

async function handleOnType() {
  if (wordCounter.value >= (inputLimit || 30)) {
    return;
  }
  textareaRef.value!.focus();
  await processText();
  if (outputChar.value === "\n") {
    emit("onEntered");
  } else if (outputChar.value === " ") {
    emit("onSpaced");
  }
  textareaRef.value!.select();
  if (currentDiac.value.length > 0) {
    textareaRef.value!.setSelectionRange(pos.value - 1, pos.value);
  } else {
    textareaRef.value!.setSelectionRange(pos.value, pos.value);
  }
}

onMounted(() => {
  textareaRef.value!.addEventListener("selectionchange", () => {
    selectionStart.value = Math.min(
      textareaRef.value!.selectionStart,
      textareaRef.value!.selectionEnd,
    );
    selectionEnd.value = Math.max(
      textareaRef.value!.selectionStart,
      textareaRef.value!.selectionEnd,
    );
  });
  textareaRef.value!.addEventListener("focus", () => {
    showKeyboard.value = onKeyboard.value;
  });
  textareaRef.value!.addEventListener("blur", () => {
    showKeyboard.value = !autoHide && onKeyboard.value;
  });
});
</script>

<template>
  <div class="container">
    <!-- Textarea for output -->
    <textarea
      ref="textareaRef"
      v-model="textModel"
      :class="`w-full bg-secondary border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none ${inputStyle}`"
      :placeholder="inputPlaceholder"
    />
    <div class="flex justify-between items-center my-2">
      <div
        :class="`text-md ml-5 ${wordCounter >= inputLimit ? 'text-red-500' : ''}`"
      >
        {{ wordCounter }}/{{ inputLimit || 30 }}
      </div>
      <NSwitch v-model:value="onKeyboard" class="align-right" size="medium">
        <template #checked>Keyboard On</template>
        <template #unchecked>Keyboard Off</template>
      </NSwitch>
    </div>
    <!-- Keyboard component -->
    <KeyboardComponent
      v-if="onKeyboard && showKeyboard"
      v-model:output="outputChar"
      v-model:buffer="currentDiac"
      @on-typed="handleOnType"
    />
  </div>
</template>
