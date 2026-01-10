<template>
  <div class="tags-container">
    <!-- 水平滚动容器 -->
    <el-scrollbar
      ref="scrollbarRef"
      class="scroll-container"
      :view-style="{ height: '100%' }"
      @wheel="handleScroll"
    >
      <div h-full flex-y-center gap-8px>
        <el-tag
          v-for="tag in visitedViews"
          :key="tag.fullPath"
          h-26px
          cursor-pointer
          :closable="!tag.affix"
          :effect="tagsViewStore.isActive(tag) ? 'dark' : 'light'"
          :type="tagsViewStore.isActive(tag) ? 'primary' : 'info'"
          @click.middle="handleMiddleClick(tag)"
          @contextmenu.prevent="(event) => openContextMenu(tag, event)"
          @close="closeSelectedTag(tag)"
          @click="
            router.push({
              path: tag.fullPath,
              query: tag.query,
            })
          "
        >
          {{ translateRouteTitle(tag.title) }}
        </el-tag>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { useTagsViewStore } from "@/store";
import { translateRouteTitle } from "@/lang/utils";

const router = useRouter();
const tagsViewStore = useTagsViewStore();
const scrollbarRef = ref();

const visitedViews = computed(() => tagsViewStore.visitedViews);

// 处理鼠标滚轮滚动
function handleScroll(event) {
  const scrollbar = scrollbarRef.value;
  if (!scrollbar) return;

  const { deltaY } = event;
  const scrollDistance = deltaY > 0 ? 100 : -100;
  scrollbar.scrollTo({ left: scrollbar.scrollLeft + scrollDistance });
}

// 中键点击关闭标签
function handleMiddleClick(tag) {
  if (tag.affix) return;
  closeSelectedTag(tag);
}

// 关闭标签
function closeSelectedTag(tag) {
  tagsViewStore.delView(tag);
}

// 右键菜单
function openContextMenu(tag, event) {
  // 右键菜单逻辑可以后续添加
  console.log("Right click on tag:", tag);
}
</script>

<style lang="scss" scoped>
.tags-container {
  width: 100%;
  height: $tags-view-height;
  padding: 0 15px;
  border-top: 1px solid var(--el-border-color-light);

  .scroll-container {
    white-space: nowrap;
  }
}
</style>
