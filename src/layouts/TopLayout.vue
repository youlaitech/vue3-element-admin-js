<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-left">
        <div v-if="showLogo" class="layout__header-logo">
          <LayoutLogo :collapse="isLogoCollapsed" />
        </div>
        <div class="layout__header-menu">
          <LayoutSidebar :data="topMenuItems" menu-mode="horizontal" base-path="" />
        </div>
      </div>
      <div class="layout__header-right">
        <LayoutToolbar />
      </div>
    </div>

    <!-- 主内容区 -->
    <div :class="{ hasTagsView: showTagsView }" class="layout__main">
      <LayoutTagsView v-if="showTagsView" />
      <LayoutMain />
    </div>
  </BaseLayout>
</template>

<script setup>
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "./useLayout";
import { usePermissionStore } from "@/store";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";

const { showTagsView, showLogo } = useLayout();
const { width } = useWindowSize();

const permissionStore = usePermissionStore();

const topMenuItems = computed(() => {
  return permissionStore.routes.filter((item) => !item.meta?.hidden);
});

const isLogoCollapsed = computed(() => width.value < 768);
</script>

<style lang="scss" scoped>
.layout {
  &__header {
    position: sticky;
    top: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: $navbar-height;
    background-color: $menu-background;

    &-left,
    &-right {
      display: flex;
      align-items: center;
      height: 100%;
    }

    &-left {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      padding-left: 20px;
    }

    &-logo {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      height: 100%;

      :deep(.logo) {
        height: $navbar-height;
      }
    }

    &-menu {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      height: 100%;
      overflow: hidden;

      :deep(.el-menu) {
        height: 100%;
        background-color: transparent;
        border: none;
      }

      :deep(.el-menu--horizontal) {
        flex: 1;
        min-width: 0;
        height: $navbar-height;
        overflow: hidden;
      }
    }

    &-right {
      padding-right: 20px;
    }
  }

  &__main {
    position: relative;

    &.hasTagsView {
      padding-top: $tags-view-height;
    }

    &:not(.hasTagsView) {
      padding-top: 0;
    }
  }
}
</style>
