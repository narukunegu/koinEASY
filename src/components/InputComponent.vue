<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  nextTick,
} from "vue";
import { NSwitch } from "naive-ui";
import { useSettingsStore } from "@/stores/settings";

import KeyboardComponent from "@/components/KeyboardComponent.vue";
import { betaCodeToGreek, greekToBetaCode } from "@/lib/betaCode";

// Reactive state for the input and keyboard modifiers
const { commandMode, inputLimit, inputStyle, inputPlaceholder, showFooter } =
  defineProps([
    "commandMode",
    "inputLimit",
    "inputStyle",
    "inputPlaceholder",
    "showFooter",
  ]);
const emit = defineEmits(["onEntered", "onSpaced"]);

const outputText = defineModel<string>("output-text");
const onGreek = defineModel<boolean>("on-greek", { default: true });
const outputChar = ref("");
const textareaRef = useTemplateRef("textareaRef");
const showVirtual = ref<boolean>(false);
const settingsStore = useSettingsStore();
const mode = ref<"normal" | "command">("normal");
const showKeyboard = ref<boolean>(showVirtual.value);

const wordCounter = computed(() => {
  return outputText.value.split(/\s+/).filter((w) => w !== "").length;
});

function handleOnEscape() {
  mode.value = "normal";
  showKeyboard.value = false;
  textareaRef.value.blur();
}
function handleKeyup(event: KeyboardEvent) {
  if (event.key === "Escape") {
    handleOnEscape();
  }
  if (event.key === "Enter") {
    emit("onEntered");
  }
  if (event.key === " ") {
    emit("onSpaced");
  }
  if (commandMode) {
    const tmp = outputText.value.trim().split(" ");
    mode.value = tmp.length <= 1 && tmp[0][0] === "/" ? "command" : "normal";
  }
  if (mode.value === "command") {
    switch (event.key) {
      case " ":
        mode.value = "normal";
        break;

      case "Enter":
        mode.value = "normal";
        break;
      default:
        break;
    }
    return;
  }
  if (!onGreek.value || event.isComposing) {
    return;
  }
  if (event.key.length > 1 && outputChar.value === "") {
    return;
  }
  let pos = textareaRef.value.selectionStart;
  const end = outputText.value.slice(pos, outputText.value.length);
  const tmp = outputText.value.slice(0, pos) + outputChar.value + end;
  pos += outputChar.value.length;
  const start = tmp.slice(0, Math.max(pos - 2, 0));
  const mid = betaCodeToGreek(
    greekToBetaCode(tmp.slice(Math.max(pos - 2, 0), pos + 1)),
  );
  outputText.value = start + mid + end.slice(1, end.length);
  nextTick(() => {
    textareaRef.value.focus();
    pos -= tmp.slice(Math.max(pos - 2, 0), pos + 1).length - mid.length;
    textareaRef.value.setSelectionRange(pos, pos);
    outputChar.value = "";
  });
}

function handleKeyboardMode() {
  settingsStore.setSetting("keyboard", showVirtual.value);
}

function handleKeypressEvent(event: KeyboardEvent) {
  if (event.shiftKey && event.key === " ") {
    event.preventDefault();
    onGreek.value = !onGreek.value;
  }
}

function handleOnBackspace() {
  const pos = textareaRef.value.selectionStart;
  outputText.value =
    outputText.value.slice(0, pos - 1) +
    outputText.value.slice(pos, outputText.value.length);

  nextTick(() => {
    textareaRef.value.focus();
    textareaRef.value.setSelectionRange(
      Math.max(pos - 1, 0),
      Math.max(pos - 1, 0),
    );
    outputChar.value = "";
  });
}

onMounted(async () => {
  showVirtual.value = await settingsStore.getSetting("keyboard");
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
        v-model="outputText"
        :class="`w-full bg-secondary border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none overflow-y-auto ${inputStyle}`"
        :placeholder="inputPlaceholder"
        @focus="showKeyboard = true"
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
          <NSwitch v-model:value="onGreek" class="align-right" size="small">
            <template #checked> Greek On </template>
            <template #unchecked> Greek Off </template>
          </NSwitch>
          <NSwitch
            v-model:value="showVirtual"
            class="align-right"
            size="small"
            @update-value="handleKeyboardMode"
          >
            <template #checked> Virtual On </template>
            <template #unchecked> Virtual Off </template>
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
      v-if="showVirtual && showKeyboard"
      v-model:output="outputChar"
      @on-typed="handleKeyup({ key: outputChar } as KeyboardEvent)"
      @on-backspaced="handleOnBackspace"
      @on-escaped="handleOnEscape"
    />
  </div>
</template>
