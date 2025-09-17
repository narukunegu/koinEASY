<script setup lang="ts">
import GreekInput from "@/components/GreekInput.vue";
import { ref } from "vue";

const outputText = ref("");
const analysisText = ref("");
const textBox = ref("");

function handleEnterEvent() {
  analysisText.value = "Analyzed -> " + outputText.value + "\r\n";
  textBox.value += outputText.value + "\r\n" + analysisText.value;
  outputText.value = "";
}
</script>

<template>
  <div class="h-[95vh] w-screen flex">
    <div class="w-1/5 border-2">Chats</div>
    <div class="flex-1 flex flex-col items-center">
      <div class="flex-1 p-4">
        Messages
        <div>{{ textBox }}</div>
      </div>
      <GreekInput
        v-model:text-model="outputText"
        class="w-2/3"
        :auto-hide="true"
        :input-limit="10"
        input-style="h-20 p-4 text-xl"
        input-placeholder="Press [Enter] to chat..."
        @on-entered="handleEnterEvent"
      />
    </div>
  </div>
</template>
