<template>
  <section class="app-main" :style="{ height: appMainHeight }">
    <router-view>
      <template #default="{ Component, route }">
        <transition enter-active-class="animate__animated animate__fadeIn" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="currentComponent(Component, route)" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </template>
    </router-view>

    <!-- 返回顶部按钮 -->
    <el-backtop target=".app-main">
      <div class="i-svg:backtop w-6 h-6" />
    </el-backtop>
  </section>
</template>

<script setup>
import { useSettingsStore, useTagsViewStore } from "@/store";
import variables from "@/styles/variables.module.scss";
import Error404 from "@/views/error/404.vue";

const { cachedViews } = toRefs(useTagsViewStore());

// 当前组件
const wrapperMap = new Map();
const currentComponent = (component, route) => {
  if (!component) return;

  const { fullPath: componentName } = route; // 使用路由路径作为组件名称
  let wrapper = wrapperMap.get(componentName);

  if (!wrapper) {
    wrapper = {
      name: componentName,
      render: () => {
        try {
          return h(component);
        } catch (error) {
          console.error(`Error rendering component for route: ${componentName}`, error);
          return h(Error404);
        }
      },
    };
    wrapperMap.set(componentName, wrapper);
  }

  return wrapper;
};

// 动态计算主内容区高度
const appMainHeight = computed(() => {
  const settingsStore = useSettingsStore();

  // 基础高度：100vh
  let height = "100vh";

  // 如果启用标签页，减去标签页高度
  if (settingsStore.showTagsView) {
    const tagsViewHeight = variables.tagsViewHeight;
    height = `calc(100vh - ${tagsViewHeight})`;
  }

  return height;
});
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  padding: 20px;
  overflow: auto;
  background-color: var(--el-bg-color-page);
}
</style>
