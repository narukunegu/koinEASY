<script lang="ts" setup>
import type { KeyType } from "@/lib/keyboardLayout";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { keyboardLayout } from "@/lib/keyboardLayout.ts";

const emit = defineEmits(["onTyped", "onBackspaced", "onEscaped"]);

// Reactive state for the input and keyboard modifiers
const output = defineModel<string>("output");
const isShifted = ref(false);
const isCapsLocked = ref(false);

// --- Computed Properties ---
const isUpperCase = computed(() => isShifted.value || isCapsLocked.value);

function getKeyValue(key: KeyType) {
  if (isUpperCase.value) {
    return key.shift || key.value.toUpperCase();
  }
  return key.value;
}

function getKeyDisplay(key: KeyType) {
  const display = key.display || key.value;
  if (isUpperCase.value) {
    return display.toUpperCase() === key.value
      ? key.shift
      : display.toUpperCase();
  }
  return display;
}

function getSubDisplay(key: KeyType) {
  if (!key.display || key.special) {
    return;
  }
  if (isUpperCase.value) {
    return key.value.toUpperCase();
  }
  return key.value;
}

function getKeyClass(key: KeyType) {
  let style =
    "keyboard-key h-12 md:h-14 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  if (key.special) {
    style =
      "keyboard-key h-12 md:h-14 bg-white rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 key-special bg-gray-300 hover:bg-gray-400 text-sm";
  } else if (key.isDiacritic) {
    style =
      "keyboard-key h-12 md:h-14 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-red-300 hover:bg-gray-400 text-sm";
  }
  return style;
}

function isSpecialKeyActive(key: KeyType) {
  return (
    key.isActive ||
    (key.value === "shift" && isShifted.value) ||
    (key.value === "caps" && isCapsLocked.value)
  );
}

// Function to handle virtual key clicks
function handleKeyPress(key: KeyType) {
  if (key.special) {
    output.value = "";
    switch (key.value) {
      case "enter":
        output.value = "\n";
        break;
      case "backspace":
        emit("onBackspaced");
        break;
      case "shift":
        isShifted.value = !isShifted.value;
        break;
      case "caps":
        isCapsLocked.value = !isCapsLocked.value;
        break;
      case "space":
        output.value = " ";
        break;
      case "tab":
        output.value = "\t";
        break;
      case "escape":
        emit("onEscaped");
        break;
    }
  } else {
    output.value = getKeyValue(key);
    if (isShifted.value) {
      isShifted.value = false;
    }
  }

  nextTick(() => {
    emit("onTyped");
  });
}
</script>

<template>
  <!-- Virtual Keyboard -->
  <div id="virtual-keyboard" class="bg-gray-200 p-4 rounded-lg shadow-inner">
    <div
      v-for="(row, rowIndex) in keyboardLayout"
      :key="rowIndex"
      class="flex justify-center gap-1 md:gap-2 mb-2"
    >
      <button
        v-for="key in row"
        :key="key.value"
        :class="[getKeyClass(key), { active: isSpecialKeyActive(key) }]"
        :style="{ flex: key.flex || 1 }"
        @click.prevent="handleKeyPress(key)"
      >
        <div class="grid grid-cols-1">
          <span class="mr-2 text-2xl">{{ getKeyDisplay(key) }}</span>
          <span class="ml-4 text-base">{{ getSubDisplay(key) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyboard-key {
  transition: all 0.1s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.keyboard-key:active {
  transform: scale(0.95);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.active {
  background-color: #3b82f6; /* blue-500 */
  color: white;
}
</style>
