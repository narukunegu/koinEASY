<script setup lang="ts">
import {
  ChatBubbleOutlineOutlined,
  ManageSearchOutlined,
  SettingsFilled,
  InfoOutlined,
} from "@vicons/material";
import { NButton, NIcon, NPopover } from "naive-ui";

const sidebarRoutes = [
  {
    name: "Fast",
    icon: ManageSearchOutlined,
    path: "/fast",
  },
  {
    name: "Fun",
    icon: ChatBubbleOutlineOutlined,
    path: "/fun",
  },
];

const sidebarBots = [
  {
    name: "Settings",
    icon: SettingsFilled,
    path: "/settings",
  },
  {
    name: "About",
    icon: InfoOutlined,
    path: "/about",
  },
];
</script>

<template>
  <aside class="flex flex-col h-dvh pb-12 pt-2 px-2 justify-between bg-sidebar">
    <nav class="grid gap-1">
      <NPopover
        v-for="sidebarRoute in sidebarRoutes"
        :key="sidebarRoute.name"
        placement="right"
        trigger="hover"
      >
        <template #trigger>
          <RouterLink :to="sidebarRoute.path">
            <NButton
              :quaternary="sidebarRoute.path !== $route.path"
              :secondary="sidebarRoute.path === $route.path"
              round
              size="tiny"
              style="padding: 15px"
            >
              <template #icon>
                <NIcon size="20" :component="sidebarRoute.icon" />
              </template>
            </NButton>
          </RouterLink>
        </template>
        {{ sidebarRoute.name }}
      </NPopover>
    </nav>
    <div class="grid grid-cols-1">
      <NPopover
        v-for="item in sidebarBots"
        :key="item.name"
        placement="right"
        trigger="hover"
      >
        <template #trigger>
          <RouterLink :to="item.path">
            <NButton
              :quaternary="item.path !== $route.path"
              :secondary="item.path === $route.path"
              round
              size="tiny"
              style="padding: 15px"
            >
              <template #icon>
                <NIcon size="20" :component="item.icon" />
              </template>
            </NButton>
          </RouterLink>
        </template>
        {{ item.name }}
      </NPopover>
    </div>
  </aside>
</template>
