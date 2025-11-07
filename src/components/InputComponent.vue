<script setup lang="ts">
import { SendRound } from "@vicons/material";
import { computed, onMounted, ref, useTemplateRef, nextTick } from "vue";
import { NButton, NIcon, NSwitch, NPopover } from "naive-ui";
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

const options = [
  {
    name: "@words",
    hint: "Return all words in the collection.",
  },
  {
    name: "@raw",
    hint: "Return raw data of given word. Example: @raw λόγος.",
  },
  {
    name: "@quiz",
    hint: "Make quiz with number of questions. Example: @quiz 20.",
  },
];

const filteredOptions = computed(() => {
  if (!commandMode || outputText.value[0] !== "@") {
    return [];
  }
  const command = outputText.value.trim().split(" ")[0];
  return options.filter((value) => value.name.includes(command));
});

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
  if (event.key === " ") {
    emit("onSpaced");
  }
  if (
    !onGreek.value ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    (!/^[a-z/\\|=()+]$/i.test(event.key) && outputChar.value === "")
  ) {
    return;
  }
  let pos = textareaRef.value.selectionStart;
  const end = outputText.value.slice(pos, outputText.value.length);
  if (/[A-Z]/.test(event.key)) {
    pos--;
    outputChar.value = `*${event.key.toLowerCase()}`;
  }
  let tmp: string = `${outputText.value.slice(0, pos) + outputChar.value} \x01${end}`;

  const words = tmp.trim().split(" ");
  let command = words.shift();
  if (commandMode && command[0] === "@") {
    command += " ";
  } else {
    words.unshift(command);
    command = "";
  }
  tmp = `${command}${betaCodeToGreek(greekToBetaCode(words.join(" ")))}`;
  pos = tmp.indexOf(` \x01`);
  tmp = tmp.replace(` \x01`, "");

  outputText.value = tmp;
  outputChar.value = "";
  nextTick(() => {
    textareaRef.value.focus();
    textareaRef.value.setSelectionRange(pos, pos);
  });
}

function handleKeyboardMode() {
  settingsStore.setSetting("keyboard", showVirtual.value);
}

function handleKeypress(event: KeyboardEvent) {
  if (event.shiftKey && event.key === " ") {
    event.preventDefault();
    onGreek.value = !onGreek.value;
  }
  if (event.key === "Enter") {
    if (commandMode) {
      event.preventDefault();
    }
    emit("onEntered");
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
});
</script>

<template>
  <!-- command suggestions -->
  <div>
    <NPopover
      :show="filteredOptions.length > 0"
      placement="top-start"
      trigger="manual"
    >
      <template #trigger>
        <div class="container">
          <!-- Textarea for output -->
          <div class="relative overflow-hidden">
            <textarea
              ref="textareaRef"
              v-model="outputText"
              :class="`w-full bg-secondary border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none overflow-y-auto ${inputStyle}`"
              :placeholder="inputPlaceholder"
              @focus="showKeyboard = true"
              @keyup.prevent="handleKeyup"
              @keypress="handleKeypress"
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
                  v-model:value="onGreek"
                  class="align-right"
                  size="small"
                >
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
              <div class="mx-2">
                <NButton
                  size="medium"
                  type="info"
                  circle
                  @click="emit('onEntered')"
                >
                  <template #icon>
                    <NIcon size="15" :component="SendRound" />
                  </template>
                </NButton>
              </div>
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
      <div v-for="command in filteredOptions" :key="command.name">
        <strong>{{ command.name }}</strong>
        <i class="ml-3">{{ command.hint }}</i>
      </div>
    </NPopover>
  </div>
</template>
