<template>
  <div class="layout-sidebar">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      :unique-opened="false"
      :background-color="variables['menu-background']"
      :text-color="variables['menu-text']"
      :active-text-color="variables['menu-active-text']"
      :mode="menuMode"
    >
      <LayoutSidebarItem
        v-for="route in routes"
        :key="route.path"
        :item="route"
        :base-path="resolveFullPath(route.path)"
      />
    </el-menu>
  </div>
</template>

<script setup>
import path from "path-browserify";
import { isExternal } from "@/utils/index";
import { useLayout } from "../useLayout";
import variables from "@/styles/variables.module.scss";
import LayoutSidebarItem from "./LayoutSidebarItem.vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  basePath: {
    type: String,
    default: "",
  },
  menuMode: {
    type: String,
    default: "vertical",
    validator: (value) => ["vertical", "horizontal"].includes(value),
  },
});

const { isSidebarOpen, activeMenu } = useLayout();

const routes = computed(() => props.data || []);
const menuMode = computed(() => props.menuMode);
const isCollapsed = computed(() => (menuMode.value === "vertical" ? !isSidebarOpen.value : false));

function resolveFullPath(routePath) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  if (!props.basePath || props.basePath === "") {
    return routePath;
  }

  return path.resolve(props.basePath, routePath);
}
</script>

<style lang="scss" scoped>
.layout-sidebar {
  height: 100%;
  overflow: hidden;
}
</style>
