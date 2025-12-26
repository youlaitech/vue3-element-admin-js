<template>
  <div>
    <!-- 菜单项 -->
    <el-menu-item v-if="!item.children || item.children.length === 0" :index="item.path">
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <template #title>
        <span>{{ item.meta?.title || item.name }}</span>
      </template>
    </el-menu-item>

    <!-- 子菜单 -->
    <el-sub-menu v-else :index="item.path" :popper-class="'layout-submenu-popper'">
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title || item.name }}</span>
      </template>

      <LayoutSidebarItem
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="item.path"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { translateRouteTitle } from "@/lang/utils";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  basePath: {
    type: String,
    default: "",
  },
});
</script>
