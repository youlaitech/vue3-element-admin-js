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
                <div
                  v-if="item.meta.icon"
                  :class="`i-svg:${item.meta.icon}`"
                  class="mr-1 w-18px h-18px"
                />
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
            <LayoutSidebarItem
              v-for="item in sideMenuRoutes"
              :key="item.path"
              :item="item"
              :base-path="activeTopMenuPath"
            />
          </el-menu>
        </el-scrollbar>
        <div class="layout__sidebar-toggle">
          <Hamburger :is-active="isSidebarOpen" @toggle-click="toggleSidebar" />
        </div>
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
import { useRoute, useRouter } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import { useLayout } from "./useLayout";
import { useAppStore, usePermissionStore, useSettingsStore } from "@/store";
import { isExternal } from "@/utils/index";
import { translateRouteTitle } from "@/lang/utils";
import { SidebarColor } from "@/enums/settings";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutToolbar from "./components/LayoutToolbar.vue";
import LayoutSidebarItem from "./components/LayoutSidebarItem.vue";
import Hamburger from "@/components/Hamburger/index.vue";
import variables from "@/styles/variables.module.scss";

const route = useRoute();
const router = useRouter();
const { width } = useWindowSize();

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const settingsStore = useSettingsStore();

const { showTagsView, showLogo, isSidebarOpen, toggleSidebar, sideMenuRoutes, activeTopMenuPath } =
  useLayout();

const isLogoCollapsed = computed(() => width.value < 768);

const useMenuColors = computed(
  () =>
    settingsStore.theme === "dark" || settingsStore.sidebarColorScheme === SidebarColor.CLASSIC_BLUE
);

const topMenuItems = computed(() => {
  const routes = permissionStore.routes.filter((item) => !item.meta?.hidden);

  return routes.map((r) => {
    if (r.meta?.alwaysShow || !r.children?.length) return r;
    const visibleChildren = r.children.filter((child) => !child.meta?.hidden);
    if (visibleChildren.length === 1) {
      const child = visibleChildren[0];
      return {
        ...r,
        meta: {
          ...r.meta,
          title: child.meta?.title || r.meta?.title,
          icon: child.meta?.icon || r.meta?.icon,
        },
      };
    }
    return r;
  });
});

const activeSideMenuPath = computed(() => {
  const { meta, path } = route;
  return typeof meta?.activeMenu === "string" ? meta.activeMenu : path;
});

function resolvePath(routePath) {
  if (isExternal(routePath)) return routePath;
  if (routePath.startsWith("/")) return `${activeTopMenuPath.value}${routePath}`;
  return `${activeTopMenuPath.value}/${routePath}`;
}

function extractTopMenuPath(path) {
  return path.split("/").filter(Boolean).length > 1 ? path.match(/^\/[^/]+/)?.[0] || "/" : "/";
}

function navigateToFirstMenu(menus) {
  if (!menus?.length) return;
  const [first] = menus;
  if (first.children?.length) {
    navigateToFirstMenu(first.children);
    return;
  }
  if (first.name) {
    router.push({
      name: first.name,
      query: typeof first.meta?.params === "object" ? first.meta.params : undefined,
    });
    return;
  }
  if (first.path) {
    router.push(resolvePath(first.path));
  }
}

function handleTopMenuSelect(menuPath) {
  if (menuPath === activeTopMenuPath.value) return;
  if (isExternal(menuPath)) {
    window.open(menuPath, "_blank");
    return;
  }

  appStore.activeTopMenu(menuPath);
  permissionStore.setMixLayoutSideMenus(menuPath);
  navigateToFirstMenu(permissionStore.mixLayoutSideMenus);
}

watch(
  () => route.path,
  (newPath) => {
    const topMenuPath = extractTopMenuPath(newPath);
    if (topMenuPath !== activeTopMenuPath.value) {
      appStore.activeTopMenu(topMenuPath);
      permissionStore.setMixLayoutSideMenus(topMenuPath);
    }
  },
  { immediate: true }
);
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
