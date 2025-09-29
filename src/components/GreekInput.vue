<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { NSwitch } from "naive-ui";
import { useSettingsStore } from "@/stores/settings";

import KeyboardComponent from "@/components/KeyboardComponent.vue";

import { normalizeGreek } from "@/lib/helpers";

// Reactive state for the input and keyboard modifiers
const {
  autoHide,
  commandMode,
  inputLimit,
  inputStyle,
  inputPlaceholder,
  showFooter,
} = defineProps([
  "autoHide",
  "commandMode",
  "inputLimit",
  "inputStyle",
  "inputPlaceholder",
  "offKeyboard",
  "showFooter",
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
const showKeyboard = ref<boolean>(!autoHide);
const settingsStore = useSettingsStore();
const onKeyboard = ref<boolean>(true);
const mode = ref<"normal" | "command">("normal");

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
  // textareaRef.value!.focus();

  await processText();

  textareaRef.value!.select();
  if (currentDiac.value.length > 0) {
    textareaRef.value!.setSelectionRange(pos.value - 1, pos.value);
  } else {
    textareaRef.value!.setSelectionRange(pos.value, pos.value);
  }

  switch (outputChar.value) {
    case "\n":
      if (autoHide) {
        textareaRef.value.blur();
      }
      emit("onEntered");
      break;
    case " ":
      emit("onSpaced");
      break;
    case "/":
      if (commandMode) {
        showKeyboard.value = false;
        mode.value = "command";
      }
      break;

    default:
      break;
  }
}

function handleOnBack() {
  textModel.value = textModel.value.slice(0, -1);
}

function handleKeyup(event: KeyboardEvent) {
  if (event.key === "Escape") {
    mode.value = "normal";
    textareaRef.value.blur();
  }
  if (!onKeyboard.value || !showKeyboard.value) {
    if (event.key === "Enter") {
      emit("onEntered");
    }
    if (event.key === " ") {
      emit("onSpaced");
    }
  }
  if (mode.value === "command") {
    switch (event.key) {
      case " ":
        showKeyboard.value = true;
        mode.value = "normal";
        break;

      case "Enter":
        mode.value = "normal";
        textareaRef.value.blur();
        break;
      default:
        break;
    }
  }
}

function handleKeyboardMode() {
  settingsStore.setSetting("keyboard", onKeyboard.value);
}

function handleSelectChange() {
  selectionStart.value = Math.min(
    textareaRef.value!.selectionStart,
    textareaRef.value!.selectionEnd,
  );
  selectionEnd.value = Math.max(
    textareaRef.value!.selectionStart,
    textareaRef.value!.selectionEnd,
  );
}

function handleKeypressEvent(event: KeyboardEvent) {
  if (!showKeyboard.value && event.shiftKey && event.key === " ") {
    event.preventDefault();
    textareaRef.value.focus();
  }
}

onMounted(async () => {
  onKeyboard.value = await settingsStore.getSetting("keyboard");
  textareaRef.value!.addEventListener("selectionchange", () => {
    handleSelectChange();
  });
  window.addEventListener("keypress", handleKeypressEvent);
});

onUnmounted(() => {
  window.removeEventListener("keypress", handleKeypressEvent);
});
</script>

<template>
  <div class="container">
    <!-- Textarea for output -->
    <div class="relative overflow-hidden">
      <textarea
        ref="textareaRef"
        v-model="textModel"
        rows="3"
        :class="`w-full bg-secondary border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none overflow-y-auto ${inputStyle}`"
        :placeholder="inputPlaceholder"
        @focus="showKeyboard = true"
        @blur="showKeyboard = !autoHide"
        @keyup="handleKeyup"
      />
      <div
        v-if="showFooter"
        class="absolute bottom-4 flex justify-between w-full items-baseline"
      >
        <div class="flex space-x-2 items-center">
          <div
            :class="`text-md ml-5 ${wordCounter >= inputLimit ? 'text-red-500' : ''}`"
          >
            {{ wordCounter }}/{{ inputLimit || 30 }}
          </div>
          <NSwitch
            v-model:value="onKeyboard"
            class="align-right"
            size="small"
            @update-value="handleKeyboardMode"
          >
            <template #checked> Keyboard On </template>
            <template #unchecked> Keyboard Off </template>
          </NSwitch>
        </div>
        <button
          class="h-10 w-10 mx-2 px-2 rounded-lg bg-gray-500"
          @click="emit('onEntered')"
        >
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
              stroke-width="1.5"
              d="m14 10l-3 3m9.288-9.969a.535.535 0 0 1 .68.681l-5.924 16.93a.535.535 0 0 1-.994.04l-3.219-7.242a.54.54 0 0 0-.271-.271l-7.242-3.22a.535.535 0 0 1 .04-.993z"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="flex justify-between items-center my-2" />
    <!-- Keyboard component -->
    <KeyboardComponent
      v-if="onKeyboard && showKeyboard"
      v-model:output="outputChar"
      v-model:buffer="currentDiac"
      @on-typed="handleOnType"
      @on-back-typed="handleOnBack"
    />
  </div>
</template>
