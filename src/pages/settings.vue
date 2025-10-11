<script setup lang="ts">
import type { Language } from "@/lib/config";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import ThemeSwitch from "@/components/ThemeSwitch.vue";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getLanguageLabel, supportedLanguages } from "@/lib/config";
import { useSettingsStore } from "@/stores/settings";

const { t, locale } = useI18n();
const availableLanguages = ref<Language[]>(supportedLanguages());
const settingsStore = useSettingsStore();

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
</script>

<template>
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
</template>
