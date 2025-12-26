<template>
  <div class="layout-sidebar">
    <el-menu
      :default-active="activeMenu"
      :collapse="!isSidebarOpen"
      :collapse-transition="false"
      :unique-opened="false"
      :background-color="variables['menu-background']"
      :text-color="variables['menu-text']"
      :active-text-color="variables['menu-active-text']"
      mode="vertical"
      router
    >
      <LayoutSidebarItem
        v-for="item in routes"
        :key="item.path"
        :item="item"
        :base-path="basePath"
      />
    </el-menu>
  </div>
</template>

<script setup>
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
});

const { isSidebarOpen, activeMenu } = useLayout();
</script>

<style lang="scss" scoped>
.layout-sidebar {
  height: 100%;
  overflow: hidden;
}
</style>
