<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!--【叶子节点】显示叶子节点或唯一子节点且父节点未配置始终显示 -->
    <template
      v-if="
        (hasOneShowingChild(item.children, item) &&
          !item.meta?.alwaysShow &&
          (!onlyOneChild.children || onlyOneChild.noShowingChildren)) ||
        (item.meta?.alwaysShow && !item.children)
      "
    >
      <AppLink
        v-if="onlyOneChild.meta"
        :to="{ path: resolvePath(onlyOneChild.path), query: onlyOneChild.meta?.params }"
      >
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <template v-if="onlyOneChild.meta">
            <MenuIcon :icon="onlyOneChild.meta.icon || item.meta?.icon" />
            <span v-if="onlyOneChild.meta.title" class="ml-1">
              {{ translateRouteTitle(onlyOneChild.meta.title) }}
            </span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <!--【非叶子节点】显示含多个子节点的父菜单，或始终显示的单子节点 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" :data-path="item.path" teleported>
      <template #title>
        <template v-if="item.meta">
          <MenuIcon :icon="item.meta.icon" />
          <span v-if="item.meta.title" class="ml-1">
            {{ translateRouteTitle(item.meta.title) }}
          </span>
        </template>
      </template>

      <LayoutSidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, ref, resolveComponent } from "vue";
import { ElIcon } from "element-plus";
import { translateRouteTitle } from "@/lang/utils";
import AppLink from "@/components/AppLink/index.vue";
import path from "path-browserify";
import { isExternal } from "@/utils/index";

defineOptions({
  name: "LayoutSidebarItem",
  inheritAttrs: false,
});

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  basePath: {
    type: String,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
});

const onlyOneChild = ref();

const MenuIcon = defineComponent({
  props: { icon: String },
  setup(iconProps) {
    const isElIcon = computed(() => iconProps.icon?.startsWith("el-icon"));
    const iconName = computed(() => iconProps.icon?.replace("el-icon-", ""));

    return () => {
      if (!iconProps.icon) {
        return h("div", { class: "i-svg:menu" });
      }

      if (isElIcon.value) {
        return h(ElIcon, null, () => h(resolveComponent(iconName.value)));
      }

      return h("div", { class: `i-svg:${iconProps.icon}` });
    };
  },
});

function hasOneShowingChild(children = [], parent) {
  const showingChildren = (children || []).filter((route) => {
    if (!route?.meta?.hidden) {
      onlyOneChild.value = route;
      return true;
    }
    return false;
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }

  return false;
}

function resolvePath(routePath) {
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return props.basePath;
  return path.resolve(props.basePath, routePath);
}
</script>

<style lang="scss">
[class^="i-svg:"] {
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: currentcolor !important;
}

.el-menu {
  .el-menu-item,
  .el-sub-menu__title {
    .el-icon {
      width: 1em !important;
      margin-right: 0 !important;
      font-size: 18px;
      color: currentcolor;
    }
  }
}

.hideSidebar {
  [class^="i-svg:"] {
    width: 18px !important;
    min-width: 18px !important;
    height: 18px !important;
    font-size: 18px !important;
  }

  .submenu-title-noDropdown {
    position: relative;

    & > span {
      display: inline-block;
      visibility: hidden;
      width: 0;
      height: 0;
      overflow: hidden;
    }
  }

  .el-sub-menu {
    overflow: hidden;

    & > .el-sub-menu__title {
      .el-sub-menu__icon-arrow {
        display: none;
      }
    }
  }

  .el-menu--collapse {
    width: $sidebar-width-collapsed;

    .el-sub-menu {
      & > .el-sub-menu__title > span {
        display: inline-block;
        visibility: hidden;
        width: 0;
        height: 0;
        overflow: hidden;
      }
    }
  }
}

html.dark {
  .el-menu-item:hover {
    background-color: $menu-hover;
  }
}

html.sidebar-color-blue {
  .el-menu-item:hover {
    background-color: $menu-hover;
  }
}

.el-sub-menu {
  &.has-active-child > .el-sub-menu__title {
    color: var(--el-color-primary) !important;
    background-color: var(--el-color-primary-light-9) !important;

    .menu-icon {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
