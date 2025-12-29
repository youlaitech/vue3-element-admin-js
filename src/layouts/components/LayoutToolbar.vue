<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <!-- 桌面端工具项 -->
    <template v-if="isDesktop">
      <!-- 搜索 -->
      <div class="navbar-actions__item">
        <CommandPalette />
      </div>

      <!-- 全屏 -->
      <div class="navbar-actions__item">
        <Fullscreen />
      </div>

      <!-- 布局大小 -->
      <div class="navbar-actions__item">
        <SizeSelect />
      </div>

      <!-- 语言选择 -->
      <div class="navbar-actions__item">
        <LangSelect />
      </div>

      <!-- 通知 -->
      <div class="navbar-actions__item">
        <NoticeDropdown />
      </div>

      <!-- 主题切换 -->
      <div class="navbar-actions__item">
        <ThemeSwitch />
      </div>

      <!-- 用户头像 -->
      <div class="navbar-actions__item">
        <NavbarUser />
      </div>

      <!-- 系统设置 -->
      <div v-if="defaults.showSettings" class="navbar-actions__item" @click="handleSettingsClick">
        <div class="i-svg:setting text-lg" />
      </div>
    </template>

    <!-- 移动端工具项 -->
    <template v-else>
      <!-- 移动端菜单按钮 -->
      <div class="navbar-actions__item">
        <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { useLayout } from "../useLayout";
import CommandPalette from "@/components/CommandPalette/index.vue";
import Fullscreen from "@/components/Fullscreen/index.vue";
import SizeSelect from "@/components/SizeSelect/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import NoticeDropdown from "@/components/NoticeDropdown/index.vue";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";
import Hamburger from "@/components/Hamburger/index.vue";
import NavbarUser from "./NavbarUser.vue";
import { useSettingsStore } from "@/store";
import { defaults } from "@/settings";

const { isDesktop, isSidebarOpen, toggleSidebar } = useLayout();
const settingsStore = useSettingsStore();

const isSidebarOpened = computed(() => isSidebarOpen.value);

function toggleSideBar() {
  toggleSidebar();
}

function handleSettingsClick() {
  settingsStore.settingsVisible = true;
}

// 工具栏样式类名
const navbarActionsClass = computed(() => ({
  "navbar-actions--mobile": !isDesktop.value,
}));
</script>

<style lang="scss" scoped>
.navbar-actions {
  display: flex;
  gap: 8px;
  align-items: center;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
  }

  &--mobile {
    gap: 12px;
  }
}
</style>
