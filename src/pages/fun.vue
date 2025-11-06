<script setup lang="ts">
import { useScroll } from "@vueuse/core";
import {
  DriveFileRenameOutlineRound,
  DeleteFilled,
  AddRound,
  BookmarkAddOutlined,
  KeyboardDoubleArrowDownRound,
} from "@vicons/material";
import { NButton, NIcon, NInput, NList, NListItem, NSpace } from "naive-ui";
import InputComponent from "@/components/InputComponent.vue";
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";

import type { MessageType } from "@/lib/dbChats";
import {
  deleteChat,
  getTitles,
  postChat,
  getChat,
  updateChat,
  updateTitle,
} from "@/lib/dbChats";
import {
  parseDict,
  parseQuiz,
  parseMorph,
  parseWordList,
  parseWordData,
  parseRaw,
} from "@/lib/words";

const loadingItem = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"> <circle cx="18" cy="12" r="0" fill="currentColor"> <animate attributeName="r" begin=".67" calcMode="spline" dur="1.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" /> </circle> <circle cx="12" cy="12" r="0" fill="currentColor"> <animate attributeName="r" begin=".33" calcMode="spline" dur="1.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" /> </circle> <circle cx="6" cy="12" r="0" fill="currentColor"> <animate attributeName="r" begin="0" calcMode="spline" dur="1.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" /> </circle> </svg>`;
const listRef = useTemplateRef<HTMLElement>("listRef");
const { y, arrivedState } = useScroll(listRef);
const request = ref("");
const messages = ref<MessageType[]>([]);
const words = ref<any[]>([]);
const lemmas = ref<string[]>();
const titleList = ref<any[]>([]);
const edittingId = ref<number>(null);
const isLoadingChat = ref(false);
const currentId = ref(null);
const quizMode = ref<boolean>(false);
const questions = ref<any[]>();
const nQuest = ref<number>();
const currQuestIndex = ref<number>(0);
const correctCount = ref<number>(0);
const currentPage = ref<number>(0);
const offsetPage = 20;

const maxPage = computed(() => {
  return Math.floor(messages.value.length / offsetPage);
});
const paginatedMessages = computed(() => {
  if (currentPage.value === maxPage.value) {
    return messages.value.slice(-offsetPage);
  }
  return messages.value.slice(
    currentPage.value * offsetPage,
    (currentPage.value + 1) * offsetPage - 1,
  );
});

function scrollToBottom() {
  if (currentPage.value !== maxPage.value) {
    return;
  }
  nextTick(() => {
    y.value = listRef.value.scrollHeight;
  });
}

watch(currentPage, () => {
  if (currentPage.value === maxPage.value) {
    nextTick(() => {
      y.value = listRef.value.scrollHeight;
    });
  }
});

function pushResponse(content: string, lemma?: string) {
  messages.value.push({ type: "response", content, lemma });
  scrollToBottom();
  currentPage.value = maxPage.value;
}

function pushRequest(content: string) {
  messages.value.push({ type: "request", content });
  request.value = "";
}

async function handleRequest() {
  if (!request.value) {
    return;
  }
  const wordList = parseWordList(request.value);
  // handle quiz mode
  if (quizMode.value) {
    // check answer
    pushRequest(request.value);
    const answer = questions.value[currQuestIndex.value].answer;
    const ind = words.value.findIndex(
      (w) => w.lemma === questions.value[currQuestIndex.value].lemma,
    );
    words.value[ind].stats.rating[1]++;
    if (answer.includes(wordList[0])) {
      pushResponse("<i>Your answer is correct!</i>");
      correctCount.value++;
      words.value[ind].stats.rating[0]++;
    } else {
      pushResponse(
        `<p><i>Your answer is incorrect!</i></p><p>The correct answer is <strong>${answer}</strong>.</p>`,
      );
    }
    // push new question
    currQuestIndex.value++;
    if (currQuestIndex.value < nQuest.value) {
      pushResponse(
        `<p>Question ${currQuestIndex.value + 1}.</p>${questions.value[currQuestIndex.value].question}<p><i>Waiting for answer.</i></p>`,
      );
    } else {
      pushResponse(
        `<p><i>The quiz has finished.</i></p><p>Your correct rating is ${Math.floor((correctCount.value / nQuest.value) * 100)}%.</p>`,
      );
      await updateChat({ chatId: currentId.value, words: words.value });
      quizMode.value = false;
    }
    return;
  }

  let content = "";
  let res: any;

  const command = wordList.shift();
  switch (command) {
    case "/raw":
      pushRequest(
        `<span class="font-extrabold pr-2">/raw</span><span>${wordList[0]}</span>`,
      );
      pushResponse(loadingItem);
      res = await parseRaw(wordList[0]);
      messages.value.pop();
      if (res.length === 0) {
        pushResponse(`No result for ${wordList[0]}.`);
      } else {
        pushResponse(res);
      }
      break;

    case "/words":
      pushRequest(`<span class="font-extrabold">/words</span>`);
      content = `<p><strong>Word collection: ${lemmas.value.length}</strong></p>`;
      content += `<p>${lemmas.value.join("; ")}</p>`;
      pushResponse(content);
      break;

    case "/morph":
      pushRequest(
        `<span class="font-extrabold pr-2">/morph</span><span>${wordList[0]}</span>`,
      );
      res = await parseMorph(wordList[0]);
      if (res.length !== 0) {
        res.forEach((table: any) => {
          pushResponse(table);
        });
      } else {
        pushResponse(`No result for ${wordList[0]}.`);
      }
      break;

    case "/quiz":
      pushRequest(
        `<span class="font-extrabold mr-2">/quiz</span><span>${wordList.join(" ")}</span>`,
      );
      nQuest.value = Number.parseInt(wordList[0]);
      if (!Number.isInteger(nQuest.value) || nQuest.value > 100) {
        pushResponse("Error command!");
      } else {
        pushResponse(loadingItem);
        questions.value = await parseQuiz(nQuest.value, words.value);
        messages.value.pop();
        if (questions.value.length === 0) {
          pushResponse("Can't genarate questions!");
        } else {
          quizMode.value = true;
          nQuest.value = questions.value.length;
          currQuestIndex.value = 0;
          correctCount.value = 0;
          pushResponse(
            `<p>Question 1.</p>${questions.value[0].question}<p><i>Waiting for answer.</i></p>`,
          );
          questions.value.forEach((q) => {
            const ind = words.value.findIndex((w) => w.lemma === q.lemma);
            words.value[ind].stats.rating = [0, 0];
          });
        }
      }
      break;
    default:
      wordList.unshift(command);
      pushRequest(request.value);
      for (let i = 0; i < wordList.length; i++) {
        pushResponse(loadingItem);
        const data = await parseDict(wordList[i]);
        messages.value.pop();
        data.forEach((item) => pushResponse(item.content, item.lemma));
        if (data.length === 0) {
          pushResponse(`No result for <strong>${wordList[i]}</strong>.`);
        }
      }
      break;
  }
}

async function handleCollect(message: MessageType) {
  if (lemmas.value.includes(message.lemma)) {
    pushRequest(
      `<i><strong>${message.lemma}</strong> has already existed.</i>`,
    );
  } else {
    const word = await parseWordData(message.lemma);
    words.value.push(word);
    lemmas.value.push(message.lemma);

    await updateChat({
      chatId: currentId.value,
      words: words.value,
    }).then(() => {
      pushResponse(
        `<i><strong>${message.lemma}</strong> is collected successfully.</i>`,
      );
    });
  }
}

async function loadChat(chatId: number) {
  isLoadingChat.value = true;
  currentId.value = chatId;
  quizMode.value = false;
  await getChat(chatId).then((data) => {
    messages.value = JSON.parse(data.messages);
    currentPage.value = 0;
    words.value = JSON.parse(data.words);
    lemmas.value = words.value.map((w) => w.lemma);
    isLoadingChat.value = false;
  });
}

async function handleAddChat() {
  const chat = {
    title: new Date().toDateString(),
    messages: [{ type: "response", content: "Χαῖρε!" }],
    words: [],
  };
  const newId = await postChat(chat);
  titleList.value.unshift({ id: newId, ...chat });
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
  if (titleList.value.length <= 1) {
    return;
  }
  const ind = titleList.value.indexOf(chat);
  if (chat.id === currentId.value) {
    await loadChat(titleList.value[ind !== 0 ? 0 : 1].id);
  }
  await deleteChat(chat.id);
  titleList.value.splice(ind, 1);
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
    <div class="w-72 border-1">
      <NList clickable hoverable>
        <template #header>
          <div class="flex justify-between">
            <div class="text-lg font-bold">Chats</div>
            <NButton size="small" round @click="handleAddChat">
              <template #icon>
                <NIcon size="20" :component="AddRound" />
              </template>
            </NButton>
          </div>
        </template>
        <NListItem
          v-for="chat in titleList"
          :key="chat.id"
          class="items-center text-sm"
          :class="{ 'bg-gray-500': chat.id === currentId }"
        >
          <template #suffix>
            <NSpace :wrap="false" align="center" justify="end" size="small">
              <NButton size="tiny" round @click="handleRename(chat.id)">
                <template #icon>
                  <NIcon size="20" :component="DriveFileRenameOutlineRound" />
                </template>
              </NButton>
              <NButton size="tiny" round @click="removeChat(chat)">
                <template #icon>
                  <NIcon size="20" :component="DeleteFilled" />
                </template>
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
            class="h-8 flex items-center"
            :class="{
              'text-white font-bold': currentId === chat.id,
            }"
            @click="loadChat(chat.id)"
          >
            {{ chat.title }}
          </div>
        </NListItem>
      </NList>
    </div>
    <div class="grow flex flex-col items-center">
      <div v-if="isLoadingChat" class="w-full flex justify-center text-lg">
        <i>Loading...</i>
      </div>
      <!-- List message -->
      <div
        ref="listRef"
        class="flex-1 w-full text-xl max-h-full mt-5 overflow-y-scroll"
      >
        <div
          v-for="(item, ind) in paginatedMessages"
          :key="ind"
          :class="item.type"
        >
          <div :class="[`message message-${item.type} mr-1`]">
            <div v-html="item.content" />
          </div>
          <NButton
            v-if="item.lemma && !lemmas.includes(item.lemma)"
            size="tiny"
            tertiary
            circle
            @click="handleCollect(item)"
          >
            <template #icon>
              <NIcon size="20" :component="BookmarkAddOutlined" />
            </template>
          </NButton>
        </div>
      </div>
      <div class="h-10 w-full flex justify-center items-center">
        <NButton
          v-if="!arrivedState.bottom"
          class="inline-flex"
          size="medium"
          ghost
        >
          <template #icon>
            <NIcon size="20" :component="KeyboardDoubleArrowDownRound" />
          </template>
          <span>Scroll to bottom</span>
        </NButton>
      </div>
      <InputComponent
        v-model:output-text="request"
        class="w-[70%]"
        :command-mode="true"
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
  cursor: text;
  user-select: text;
  max-width: 80%;
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
}

table {
  text-align: center;
  width: 40vw;
  border-collapse: collapse;
}

th,
td {
  padding: auto;
}

.dark table {
  border: 1px solid var(--color-white);
}

.dark th,
td {
  border: 1px solid var(--color-white);
}
</style>
