<script setup lang="ts">
import type { VirtualListInst } from "naive-ui";
import {
  NButton,
  NInput,
  NList,
  NListItem,
  NSpace,
  NSpin,
  NVirtualList,
} from "naive-ui";
import GreekInput from "@/components/GreekInput.vue";
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";

import type { MessageType } from "@/lib/dbChats";
import {
  deleteChat,
  getChat,
  getTitles,
  postChat,
  updateChat,
  updateTitle,
} from "@/lib/dbChats";
import { parseWordList, analyzeWord } from "@/lib/data";

const request = ref("");
const messages = ref<MessageType[]>([]);
const titleList = ref<any[]>([]);
const edittingId = ref<number>(null);
const isLoading = ref(true);
const listRef = ref<VirtualListInst>();
const currentId = ref(null);

const computedMessages = computed(() => {
  return messages.value.slice(-20);
});

async function handleRequest() {
  messages.value.push({ type: "request", content: request.value });
  const wordList = parseWordList(request.value);
  request.value = "";

  const command = wordList.shift();
  switch (command) {
    case "/sentence":
      break;

    default:
      wordList.unshift(command);
      for (let i = 0; i < wordList.length; i++) {
        isLoading.value = true;
        await analyzeWord(wordList[i]).then((words) => {
          words.forEach((w) =>
            messages.value.push({ type: "response", content: w }),
          );
          if (words.length === 0) {
            messages.value.push({
              type: "response",
              content: `No result for <strong>${wordList[i]}</strong>`,
            });
          }
          isLoading.value = false;
        });
      }
      break;
  }
}

async function handleCollect(message: any) {
  await updateChat({
    chatId: currentId.value,
    message: message.content,
    word: message,
  });
}

async function loadChat(chatId: number) {
  isLoading.value = true;
  await getChat(chatId).then((data) => {
    messages.value = JSON.parse(data.messages);
    isLoading.value = false;
    currentId.value = chatId;
  });
}

async function handleAddChat() {
  const newChat = {
    title: "untitled",
    messages: [{ type: "response", content: "Χαῖρε!" }],
    words: [],
  };
  const newId = await postChat(newChat);
  titleList.value.unshift({ id: newId, ...newChat });
  await loadChat(newId);
}

async function renameChat(chat: any) {
  if (chat.title === "") {
    return;
  }
  await updateTitle(chat);
  edittingId.value = null;
}

async function removeChat(chat: any) {
  // delete
  if (titleList.value.length === 0) {
    return;
  }
  const ind = titleList.value.indexOf(chat);
  if (chat.id === currentId.value) {
    await loadChat(titleList.value[ind !== 0 ? 0 : 1].id);
  }
  titleList.value.splice(ind, 1);
  await deleteChat(chat.id);
}

function handleRename(chatId: number) {
  edittingId.value = chatId;
}

function handleCancelRename() {
  edittingId.value = null;
}

onMounted(async () => {
  titleList.value = await getTitles();
  await loadChat(titleList.value[0].id);
});
</script>

<template>
  <div class="h-[95vh] w-[95vw] flex">
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
        <NListItem
          v-for="chat in titleList"
          :key="chat.id"
          :class="{ 'bg-gray-500': chat.id === currentId }"
          @click="loadChat(chat.id)"
        >
          <template #suffix>
            <NSpace :wrap="false" align="center" justify="end" size="small">
              <NButton size="tiny" round @click="handleRename(chat.id)">
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
              <NButton size="tiny" round @click="removeChat(chat)">
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
            @keyup.enter.prevent="renameChat(chat)"
            @keydown.escape.prevent="handleCancelRename"
            @blur="handleCancelRename"
          />
          <div
            v-else
            :class="{
              'text-white font-bold': currentId === chat.id,
            }"
          >
            {{ chat.title }}
          </div>
        </NListItem>
      </NList>
    </div>
    <div class="grow flex flex-col items-center">
      <div class="flex-1 w-full relative">
        <NVirtualList
          ref="listRef"
          class="text-xl max-h-[70vh] pt-5"
          :item-size="30"
          :items="computedMessages"
          item-resizable
        >
          <template #default="{ item }">
            <div :class="item.type">
              <div :class="[`message message-${item.type} mr-1`]">
                <div v-html="item.content" />
              </div>
              <NButton
                v-if="item.type === 'response'"
                size="tiny"
                tertiary
                circle
                @click="handleCollect(item)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="m11.066 8.004l.184-.005h7.5a3.25 3.25 0 0 1 3.245 3.065l.005.185v7.5a3.25 3.25 0 0 1-3.066 3.245l-.184.005h-7.5a3.25 3.25 0 0 1-3.245-3.066L8 18.75v-7.5a3.25 3.25 0 0 1 3.066-3.245M18.75 9.5h-7.5a1.75 1.75 0 0 0-1.744 1.606l-.006.144v7.5a1.75 1.75 0 0 0 1.607 1.744l.143.006h7.5a1.75 1.75 0 0 0 1.744-1.607l.006-.143v-7.5a1.75 1.75 0 0 0-1.75-1.75M15 11a.75.75 0 0 1 .75.75v2.498h2.5a.75.75 0 0 1 0 1.5h-2.5v2.502a.75.75 0 0 1-1.5 0v-2.502h-2.5a.75.75 0 1 1 0-1.5h2.5V11.75A.75.75 0 0 1 15 11m.582-6.767l.052.177l.693 2.588h-1.553l-.588-2.2a1.75 1.75 0 0 0-2.144-1.238L4.798 5.502a1.75 1.75 0 0 0-1.27 1.995l.032.148l1.942 7.244A1.75 1.75 0 0 0 7 16.176v1.506a3.25 3.25 0 0 1-2.895-2.228l-.052-.176l-1.941-7.245a3.25 3.25 0 0 1 2.12-3.928l.178-.052l7.244-1.941a3.25 3.25 0 0 1 3.928 2.12"
                  />
                </svg>
              </NButton>
            </div>
          </template>
        </NVirtualList>
        <NSpin :show="isLoading" size="large">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <circle cx="18" cy="12" r="0" fill="currentColor">
              <animate
                attributeName="r"
                begin=".67"
                calcMode="spline"
                dur="1.5s"
                keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
                repeatCount="indefinite"
                values="0;2;0;0"
              />
            </circle>
            <circle cx="12" cy="12" r="0" fill="currentColor">
              <animate
                attributeName="r"
                begin=".33"
                calcMode="spline"
                dur="1.5s"
                keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
                repeatCount="indefinite"
                values="0;2;0;0"
              />
            </circle>
            <circle cx="6" cy="12" r="0" fill="currentColor">
              <animate
                attributeName="r"
                begin="0"
                calcMode="spline"
                dur="1.5s"
                keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8"
                repeatCount="indefinite"
                values="0;2;0;0"
              />
            </circle>
          </svg>
        </NSpin>
      </div>
      <GreekInput
        v-model:text-model="request"
        class="absolute w-[50%] bottom-4"
        :auto-hide="true"
        :input-limit="20"
        input-style="h-30 p-2 text-xl"
        input-placeholder="Press [Enter] to chat..."
        :show-footer="true"
        @on-entered="handleRequest()"
      />
    </div>
  </div>
</template>

<style>
.message {
  margin-bottom: 4px;
  border-radius: 12px;
  word-break: normal;
  margin-left: 50px;
  padding: 10px;
}

.request {
  display: flex;
  justify-content: end;
  padding-right: 50px;
}

.response {
  display: flex;
}

.message-response {
  background: var(--color-gray-500);
}

.message-request {
  background: var(--color-blue-400);
  max-width: 80%;
}
</style>
