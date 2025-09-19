<script setup lang="ts">
import { NButton, NInput, NList, NListItem, NSpace } from "naive-ui";
import GreekInput from "@/components/GreekInput.vue";
import { onMounted, ref } from "vue";

import {
  deleteChat,
  getChat,
  getTitles,
  postChat,
  updateChat,
} from "@/lib/dbChats";
import { requestProcess } from "@/lib/requestProcess";

const request = ref("");
const messages = ref("");
const titleList = ref<any[]>([]);
const edittingId = ref<number>(null);
const classSelf = "flex justify-end break-words rounded-lg px-3 py-2";
const classOther = "flex justify-start break-words rounded-lg px-3 py-2";

async function handleEnterEvent() {
  const response = await requestProcess(request.value);
  messages.value += `<div class="${classSelf}"><div class="flex-1"></div><div class="bg-blue-600 text-white mr-10">${request.value}</div></div>`;
  messages.value += `<div class="${classOther}"><div class="flex-1"></div><div class="bg-gray-200 text-gray-900">${response}</div></div>`;
}

async function loadChat(chatId: number) {
  const chat = await getChat(chatId);
  messages.value = chat.messages;
}

async function handleAddChat() {
  const newChat = {
    title: "untitled",
    messages: `<div class="${classOther}">Χαῖρε!</div>`,
  };
  const newId = await postChat(newChat);
  titleList.value.unshift({ id: newId, ...newChat });
  // edittingId.value = newId;
  await loadChat(newId);
}

async function renameChat(chat: any) {
  if (chat.title === "") {
    return;
  }
  await updateChat(chat);
  edittingId.value = null;
}

async function removeChat(chat: any) {
  // delete
  await deleteChat(chat.id);
  titleList.value.splice(titleList.value.indexOf(chat), 1);
}

onMounted(async () => {
  titleList.value = await getTitles();
  await loadChat(titleList.value[0].id);
});
</script>

<template>
  <div class="h-[95vh] w-screen flex">
    <div class="w-1/5 border-2">
      <NList clickable hoverable>
        <template #header>
          <div class="flex">
            <div class="flex-1 text-xl font-medium">Chats</div>
            <NButton size="small" round @click="handleAddChat">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"
                />
              </svg>
            </NButton>
          </div>
        </template>
        <NListItem v-for="chat in titleList" :key="chat.id">
          <template #suffix>
            <NSpace :wrap="false" align="center" justify="end" size="small">
              <NButton size="small" round @click="edittingId = chat.id">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="m15 16l-4 4h10v-4zm-2.94-8.81L3 16.25V20h3.75l9.06-9.06zm6.65.85c.39-.39.39-1.04 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"
                  />
                </svg>
              </NButton>
              <NButton size="small" round @click="removeChat(chat)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"
                  />
                </svg>
              </NButton>
            </NSpace>
          </template>
          <NInput
            v-if="edittingId === chat.id"
            v-model:value="chat.title"
            placeholder="Enter title..."
            size="medium"
            :autofocus="true"
            @keydown.enter.prevent="renameChat(chat)"
          />
          <div v-else class="text-md" @click="loadChat(chat.id)">
            {{ chat.title }}
          </div>
        </NListItem>
      </NList>
    </div>
    <div class="flex-1 flex flex-col items-center">
      <div class="flex-1 w-full">
        <div v-html="messages" />
      </div>
      <GreekInput
        v-model:text-model="request"
        class="w-2/3"
        :auto-hide="true"
        :input-limit="20"
        input-style="h-30 p-2 text-xl"
        input-placeholder="Press [Enter] to chat..."
        :show-footer="true"
        @on-entered="handleEnterEvent"
      />
    </div>
  </div>
</template>
