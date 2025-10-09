<script setup lang="ts">
import { useScroll } from "@vueuse/core";
import { NButton, NInput, NList, NListItem, NSpace } from "naive-ui";
import InputComponent from "@/components/InputComponent.vue";
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";

import type { MessageType } from "@/lib/dbChats";
import {
  deleteChat,
  getMessages,
  getTitles,
  getWords,
  postChat,
  getChat,
  updateChat,
  updateTitle,
} from "@/lib/dbChats";
import {
  analyzeWord,
  parseLemma,
  parseQuiz,
  parseTableMorph,
  parseWordList,
  parseWordData,
} from "@/lib/words";
import dictionary from "@/assets/dictionary.json";

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

function pushResponse(content: string) {
  messages.value.push({ type: "response", content });
  scrollToBottom();
  currentPage.value = maxPage.value;
}

function pushRequest(content: string) {
  messages.value.push({ type: "request", content });
  request.value = "";
}

async function handleRequest() {
  const wordList = parseWordList(request.value);
  // handle quiz mode
  if (quizMode.value) {
    // check answer
    pushRequest(request.value);
    const answer = questions.value[currQuestIndex.value].answer;
    const ind = words.value.findIndex(
      (w) => w.lemma === questions.value[currQuestIndex.value].lemma,
    );
    words.value[ind].rating[1]++;
    if (answer.includes(wordList[0])) {
      pushResponse("<i>Your answer is correct!</i>");
      correctCount.value++;
      words.value[ind].rating[0]++;
    } else {
      pushResponse(
        `<p><i>Your answer is incorrect!</i></p><p>The correct answer is <strong>${answer.join("/")}</strong>.</p>`,
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
      quizMode.value = false;
    }
    return;
  }

  let content = "";
  let res: any;
  const lemmaList = Object.keys(dictionary);

  const command = wordList.shift();
  switch (command) {
    case "/dict":
      pushRequest(
        `Test dict ${lemmaList.filter((v) => v.includes(wordList[0])).length}`,
      );
      break;

    case "/words":
      pushRequest(`<span class="font-extrabold underline">/words</span>`);
      content = `<p><strong>Collected words: ${words.value.length}</strong></p>`;
      content += `<p>${words.value.map((w) => w.lemma).join("; ")}</p>`;
      pushResponse(content);
      break;
    case "/morph":
      pushRequest(
        `<span class="font-extrabold underline pr-2">/morph</span><span>${wordList[0]}</span>`,
      );
      res = words.value.find((w) => w.lemma === wordList[0]);
      if (res) {
        const tables = parseTableMorph(res.lemma, res.extras);
        tables.forEach((table) => {
          pushResponse(table);
        });
      } else {
        pushResponse(`No result for ${wordList[0]}.`);
      }
      break;
    case "/quiz":
      pushRequest(
        `<span class="font-extrabold underline mr-2">/quiz</span><span>${wordList.join(" ")}</span>`,
      );
      nQuest.value = Number.parseInt(wordList[0]);
      if (!Number.isInteger(nQuest.value) || nQuest.value > 100) {
        pushResponse("Error command!");
      } else {
        pushResponse(loadingItem);
        questions.value = await parseQuiz(nQuest.value, words.value);
        messages.value.pop();
        if (!questions.value) {
          pushResponse("Can't genarate questions!");
        } else {
          quizMode.value = true;
          currQuestIndex.value = 0;
          correctCount.value = 0;
          pushResponse(
            `<p>Question 1.</p>${questions.value[0].question}<p><i>Waiting for answer.</i></p>`,
          );
          questions.value.forEach((q) => {
            const ind = words.value.findIndex((w) => w.lemma === q.lemma);
            words.value[ind].rating = [0, 0];
          });
        }
      }
      break;
    default:
      wordList.unshift(command);
      pushRequest(request.value);
      for (let i = 0; i < wordList.length; i++) {
        pushResponse(loadingItem);
        await analyzeWord(wordList[i]).then((data) => {
          messages.value.pop();
          data.forEach((content) => pushResponse(content));
          if (data.length === 0) {
            pushResponse(`No result for <strong>${wordList[i]}</strong>`);
          }
        });
      }
      break;
  }
}

function isCollectable(item: MessageType) {
  return (
    item.type === "response" &&
    item.content.includes(`class="lemma"`) &&
    !lemmas.value.includes(parseLemma(item.content))
  );
}

async function handleCollect(message: any) {
  const lemma = parseLemma(message.content);
  const word = await parseWordData(lemma);
  if (lemmas.value.includes(lemma)) {
    pushRequest(`<i><strong>${lemma}</strong> has already existed.</i>`);
  } else {
    await updateChat({
      chatId: currentId.value,
      word,
    }).then(() => {
      words.value.push(word);
      lemmas.value.push(lemma);
      pushResponse(
        `<i><strong>${lemma}</strong> is collected successfully.</i>`,
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
    <div class="w-1/5 border-1">
      <NList clickable hoverable>
        <template #header>
          <div class="flex justify-between">
            <div class="text-xl font-bold">Chats</div>
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
          class="items-center text-lg"
          :class="{ 'bg-gray-500': chat.id === currentId }"
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
        class="flex-1 w-full text-xl max-h-full mt-5 overflow-y-scroll select-text cursor-text"
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
            v-if="isCollectable(item)"
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
      </div>
      <div class="h-10 w-full flex justify-center items-center">
        <NButton
          v-if="!arrivedState.bottom"
          class="inline-flex"
          size="medium"
          ghost
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M11 4h2v12l5.5-5.5l1.42 1.42L12 19.84l-7.92-7.92L5.5 10.5L11 16z"
            />
          </svg>
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

table {
  text-align: center;
  width: 60vw;
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
