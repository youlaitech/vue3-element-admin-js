<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-left">
        <LayoutLogo v-if="showLogo" :collapse="isLogoCollapsed" />
        <LayoutSidebar :data="routes" menu-mode="horizontal" base-path="" />
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
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";

const { showTagsView, showLogo, routes } = useLayout();
const { width } = useWindowSize();

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
      flex: 1;
      padding-left: 20px;
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
