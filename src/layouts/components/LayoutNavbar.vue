<template>
  <div class="navbar">
    <div class="flex-y-center">
      <!-- 菜单折叠按钮 -->
      <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />
      <!-- 面包屑导航 -->
      <Breadcrumb />
    </div>
    <!-- 导航栏操作区域 -->
    <div class="navbar__actions">
      <LayoutToolbar />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from "@/store";
import Hamburger from "@/components/Hamburger/index.vue";
import Breadcrumb from "@/components/Breadcrumb/index.vue";

const appStore = useAppStore();

const isSidebarOpened = computed(() => appStore.sidebar.opened);

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $navbar-height;
  padding: 0 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);

  &__actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}
</style>
