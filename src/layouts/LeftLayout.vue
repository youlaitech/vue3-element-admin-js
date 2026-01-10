<template>
  <BaseLayout>
    <!-- 左侧菜单栏 -->
    <div class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
      <div :class="{ 'has-logo': showLogo }" class="layout-sidebar">
        <LayoutLogo v-if="showLogo" :collapse="!isSidebarOpen" />
        <el-scrollbar>
          <LayoutSidebar :data="routes" base-path="" />
        </el-scrollbar>
      </div>
    </div>

    <!-- 主内容区 -->
    <div
      class="layout__main"
      :class="{ hasTagsView: showTagsView, 'layout__main--collapsed': !isSidebarOpen }"
    >
      <div class="fixed-header">
        <LayoutNavbar />
        <LayoutTagsView v-if="showTagsView" />
      </div>
      <LayoutMain />
    </div>
  </BaseLayout>
</template>

<script setup>
import { useLayout } from "./useLayout";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutNavbar from "./components/LayoutNavbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";

const { showTagsView, showLogo, isSidebarOpen, routes } = useLayout();
</script>

<style lang="scss" scoped>
.layout {
  &__sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 999;
    width: $sidebar-width;
    background-color: $menu-background;
    transition: width 0.28s;

    &--collapsed {
      width: $sidebar-width-collapsed;
    }

    .layout-sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;

      &:not(.has-logo) {
        .el-scrollbar {
          height: 100%;
        }
      }

      &.has-logo {
        .el-scrollbar {
          height: calc(100% - #{$navbar-height});
        }
      }
    }
  }

  &__main {
    position: relative;
    height: 100%;
    margin-left: $sidebar-width;
    transition: margin-left 0.28s;

    &--collapsed {
      margin-left: $sidebar-width-collapsed;
    }

    .fixed-header {
      position: sticky;
      top: 0;
      z-index: 9;
      transition: width 0.28s;
    }
  }
}
</style>
