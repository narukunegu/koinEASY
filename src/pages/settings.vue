<script setup lang="ts">
import type { Language } from "@/lib/config";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import ThemeSwitch from "@/components/ThemeSwitch.vue";
// import GreekInput from "@/components/GreekInput.vue";
import InputComponent from "@/components/InputComponent.vue";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NButton, NDivider, NInput, NTabs, NTabPane } from "naive-ui";
import { getWord, updateWord } from "@/lib/dbDict";
import { parseLemma } from "@/lib/words";

import { getLanguageLabel, supportedLanguages } from "@/lib/config";
import { useSettingsStore } from "@/stores/settings";

const { t, locale } = useI18n();
const availableLanguages = ref<Language[]>(supportedLanguages());
const settingsStore = useSettingsStore();

const wordQuery = ref("");
const wordData = ref<any>();
const textModel = ref("");

watch(
  locale,
  (newLocale, oldLocale) => {
    if (newLocale && newLocale !== oldLocale) {
      handleLanguageSelect(newLocale);
    }
  },
  { immediate: true },
);

function handleLanguageSelect(newLocale: string) {
  if (
    !newLocale ||
    !availableLanguages.value.some((sl) => sl.value === newLocale)
  ) {
    return;
  }
  settingsStore.setSetting<string>("language", newLocale);
}

async function loadWord() {
  if (wordQuery.value === "") {
    return;
  }
  textModel.value = "Loading...";
  await getWord(wordQuery.value).then((word) => {
    wordData.value = word;
    if (!word) {
      textModel.value = `No result for ${wordQuery.value}`;
    } else {
      const tmp = [];
      let start = word.m.indexOf(`<li class="morph-grc-li"`);
      let end = word.m.indexOf(`</li>`, start);
      while (start !== -1) {
        tmp.push(word.m.substring(start, end + 5));
        start = word.m.indexOf(`<li class="morph-grc-li"`, end);
        end = word.m.indexOf(`</li>`, start);
      }

      textModel.value = `${word.m.substring(0, word.m.indexOf("<ul"))}\n<ul>${tmp.join("\n")}</ul>`;
    }
    wordQuery.value = "";
  });
}

async function handleUpdateWord() {
  wordData.value.m = textModel.value.replace(/\n/g, "");
  wordData.value.w = parseLemma(wordData.value.m);
  textModel.value = "Updating...";
  await updateWord(wordData.value);
  textModel.value = "Updated successfully.";
}
</script>

<template>
  <NTabs class="container mx-auto p-10" type="card" size="large">
    <NTabPane key="settings" name="Settings" display-directive="show">
      <div class="space-y-0.5 p-5">
        <p class="text-muted-foreground text-xl">
          {{ t("settings.description") }}
        </p>
      </div>
      <NDivider class="my-6" />
      <div class="space-y-8 pl-10">
        <div class="flex items-center space-x-2">
          <Label class="text-lg font-medium" for="theme-switch">{{
            t("settings.theme.label")
          }}</Label>
          <ThemeSwitch />
        </div>
        <div class="flex items-center space-x-2">
          <Label class="text-lg font-medium" for="language-select">{{
            t("languages.label")
          }}</Label>
          <Select id="language-select" v-model="locale">
            <SelectTrigger>
              <SelectValue :placeholder="getLanguageLabel(locale)" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="availableLanguage in availableLanguages"
                  :key="availableLanguage.value"
                  :value="availableLanguage.value"
                >
                  {{ availableLanguage.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </NTabPane>
    <NTabPane name="Database">
      <div class="flex flex-col text-xl space-y-2 pl-5">
        <InputComponent
          v-model:output-text="wordQuery"
          class="w-[50vw]"
          input-style="h-10 p-1 text-md"
          input-placeholder="Search..."
          :on-greek="true"
          :show-footer="false"
          @on-entered="loadWord"
        />
        <NInput
          v-model:value="textModel"
          type="textarea"
          placeholder="Meaning..."
          size="large"
          rows="15"
          :resizable="false"
          style="width: 80vw; font-size: 20px"
        />
        <div>
          <NButton
            size="large"
            type="info"
            style="margin-right: 5px"
            @click="loadWord"
          >
            Load
          </NButton>
          <NButton
            size="large"
            type="success"
            style="margin-right: 5px"
            @click="handleUpdateWord"
          >
            Update
          </NButton>
          <NButton size="large" type="warning"> Remove Dialect </NButton>
        </div>
      </div>
    </NTabPane>
  </NTabs>
</template>
