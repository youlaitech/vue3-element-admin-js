<template>
  <BaseLayout>
    <!-- 顶部菜单栏 -->
    <div class="layout__header">
      <div class="layout__header-content">
        <div v-if="showLogo" class="layout__header-logo">
          <LayoutLogo :collapse="isLogoCollapsed" />
        </div>

        <!-- 顶部菜单 -->
        <div class="layout__header-menu">
          <el-menu
            mode="horizontal"
            :default-active="activeTopMenuPath"
            :background-color="useMenuColors ? variables['menu-background'] : undefined"
            :text-color="useMenuColors ? variables['menu-text'] : undefined"
            :active-text-color="useMenuColors ? variables['menu-active-text'] : undefined"
            @select="handleTopMenuSelect"
          >
            <el-menu-item v-for="item in topMenuItems" :key="item.path" :index="item.path">
              <template v-if="item.meta">
                <MenuIcon :icon="item.meta.icon" />
                <span v-if="item.meta.title" class="ml-1">
                  {{ translateRouteTitle(item.meta.title) }}
                </span>
              </template>
            </el-menu-item>
          </el-menu>
        </div>

        <div class="layout__header-actions">
          <LayoutToolbar />
        </div>
      </div>
    </div>

    <!-- 主内容区容器 -->
    <div class="layout__container">
      <!-- 左侧菜单栏 -->
      <div class="layout__sidebar--left" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
        <el-scrollbar>
          <el-menu
            :default-active="activeSideMenuPath"
            :collapse="!isSidebarOpen"
            :collapse-transition="false"
            :unique-opened="false"
            :background-color="variables['menu-background']"
            :text-color="variables['menu-text']"
            :active-text-color="variables['menu-active-text']"
          >
            <el-sub-menu
              v-for="item in sideMenuRoutes"
              :key="item.path"
              :index="item.path"
              :popper-class="'layout-submenu-popper'"
            >
              <template #title>
                <MenuIcon :icon="item.meta?.icon" />
                <span>{{ translateRouteTitle(item.meta?.title) }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="child.path"
                :index="child.path"
                @click="handleSideMenuClick(child)"
              >
                <MenuIcon :icon="child.meta?.icon" />
                <span>{{ translateRouteTitle(child.meta?.title) }}</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </div>

      <!-- 主内容区 -->
      <div
        class="layout__main"
        :class="{
          hasTagsView: showTagsView,
          'layout__main--collapsed': !isSidebarOpen,
        }"
      >
        <LayoutTagsView v-if="showTagsView" />
        <LayoutMain />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { useLayout } from "./useLayout";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import { useSettingsStore } from "@/store";
import variables from "@/styles/variables.module.scss";

const settingsStore = useSettingsStore();
const { showTagsView, showLogo, isSidebarOpen, routes, sideMenuRoutes, activeTopMenuPath } =
  useLayout();

const useMenuColors = computed(() => settingsStore.sidebarColorScheme === "theme");

const isLogoCollapsed = computed(() => false);

const topMenuItems = computed(() =>
  routes.value.filter((route) => route.children && route.children.length > 0)
);

const activeSideMenuPath = computed(() => {
  const currentPath = activeTopMenuPath.value;
  return currentPath || routes.value[0]?.path;
});

function handleTopMenuSelect(path) {
  // 处理顶部菜单选择
  console.log("Top menu selected:", path);
}

function handleSideMenuClick(menuItem) {
  // 处理侧边菜单点击
  console.log("Side menu clicked:", menuItem);
}

function translateRouteTitle(title) {
  // 路由标题翻译逻辑
  return title || "";
}
</script>

<style lang="scss" scoped>
.layout {
  &__header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1000;
    height: $navbar-height;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    transition: all 0.28s;

    &-content {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 20px;
    }

    &-logo {
      margin-right: 20px;
    }

    &-menu {
      flex: 1;
      margin: 0 20px;
    }

    &-actions {
      display: flex;
      align-items: center;
    }
  }

  &__container {
    display: flex;
    min-height: 100vh;
    padding-top: $navbar-height;
  }

  &__sidebar {
    &--left {
      width: $sidebar-width;
      background-color: $menu-background;
      transition: width 0.28s;

      &--collapsed {
        width: $sidebar-width-collapsed;
      }
    }
  }

  &__main {
    flex: 1;
    transition: margin-left 0.28s;

    &.hasTagsView {
      padding-top: $tags-view-height;
    }
  }
}
</style>
