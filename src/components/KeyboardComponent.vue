<script lang="ts" setup>
import type { KeyType } from "@/lib/keyMap.ts";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { diacriticsMap } from "@/lib/diacriticsMap.ts";
import { keyboardLayout } from "@/lib/keyboardLayout.ts";
import { diacriticsKey, physicalKeyMap } from "@/lib/keyMap.ts";

const emit = defineEmits(["onTyped", "onBackTyped"]);

// Reactive state for the input and keyboard modifiers
const output = defineModel<string>("output");
const isShifted = ref(false);
const isCapsLocked = ref(false);
const currentDiacritic = defineModel<string[]>("buffer");

// --- Computed Properties ---
const isUpperCase = computed(() => isShifted.value || isCapsLocked.value);

function getKeyValue(key: KeyType) {
  if (key.display) {
    return key.display;
  }
  if (isUpperCase.value) {
    return key.shift || key.value.toUpperCase();
  }
  return key.value;
}

function getSubKeyValue(key: KeyType) {
  if (key.display) {
    return;
  }
  if (isUpperCase.value && key.sub) {
    return key.sub.toUpperCase();
  }
  return key.sub;
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
function handleKeyPress(key: KeyType, isVirtual = true) {
  const vKey: string = (isShifted.value ? key.shift : key.value) || "";
  if (key.special) {
    switch (key.value) {
      case "enter":
        output.value = "\n";
        break;
      case "backspace":
        output.value = "";
        emit("onBackTyped");
        break;
      case "shift":
        isShifted.value = !isShifted.value;
        break;
      case "caps":
        output.value = "";
        isCapsLocked.value = !isCapsLocked.value;
        break;
      case "space":
        output.value = " ";
        break;
      case "tab":
        output.value = "\t";
        break;
    }
    currentDiacritic.value = [];
  } else if (currentDiacritic.value!.length > 0 && diacriticsKey[vKey]) {
    currentDiacritic.value!.push(diacriticsKey[vKey] as string);
    const combined = Object.entries(diacriticsMap).find(([...v]) => {
      return v[1].sort().join("-") === currentDiacritic.value!.sort().join("-");
    });

    if (combined) {
      output.value = combined[0];
    } else {
      output.value = "";
      currentDiacritic.value = [];
    }
  } else {
    output.value = getKeyValue(key);
    if (key.hasDiacritic) {
      currentDiacritic.value = [getKeyValue(key)];
    } else {
      currentDiacritic.value = [];
    }
    if (isVirtual && isShifted.value) {
      isShifted.value = false;
    }
  }

  nextTick(() => {
    emit("onTyped");
  });
}

// Function to handle physical keyboard input events
function handlePhysicalKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey || event.altKey || event.metaKey) {
    return;
  }
  if (event.shiftKey) {
    isShifted.value = true;

    if (event.key === "Shift") {
      return;
    }
  }

  const keyCode = event.code;
  const keyData = physicalKeyMap[keyCode] || physicalKeyMap[event.key];

  if (keyData) {
    event.preventDefault(); // Prevent default browser behavior
    const charToType = keyData[0];
    let virtualKey = keyboardLayout.value
      .flat()
      .find((k) => k.value === charToType);
    virtualKey =
      virtualKey ||
      keyboardLayout.value.flat().find((k) => k.shift === charToType);
    if (virtualKey) {
      virtualKey.isActive = true;
      handleKeyPress(virtualKey, false);
    }
  } else {
    currentDiacritic.value = [];
  }
}

function handlePhysicalKeyUp(event: KeyboardEvent) {
  const keyCode = event.code;
  if (keyCode === "ShiftLeft" || keyCode === "ShiftRight") {
    isShifted.value = false;
  } else {
    keyboardLayout.value.flat().forEach((key) => {
      if (key.isActive) {
        key.isActive = false;
      }
    });
  }
}

// Lifecycle hooks to manage event listeners
onMounted(() => {
  window.addEventListener("keydown", handlePhysicalKeyDown);
  window.addEventListener("keyup", handlePhysicalKeyUp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handlePhysicalKeyDown);
  window.removeEventListener("keyup", handlePhysicalKeyUp);
});
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
        @click="handleKeyPress(key)"
      >
        <div class="grid grid-cols-1">
          <span class="mr-2 text-2xl">{{ getKeyValue(key) }}</span>
          <span class="ml-4 text-base">{{ getSubKeyValue(key) }}</span>
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
