<template>
  <el-icon v-if="isElementPlusIcon" class="layout-menu-icon">
    <component :is="iconName" />
  </el-icon>
  <span v-else-if="isSvgIcon" class="layout-menu-icon" :class="icon" />
  <span v-else class="layout-menu-icon i-svg:menu" />
</template>

<script setup>
defineProps({
  icon: { type: String, default: "" },
});

const isElementPlusIcon = computed(() => {
  return typeof icon === "string" && icon.startsWith("el-icon-");
});

const isSvgIcon = computed(() => {
  return typeof icon === "string" && icon.startsWith("i-svg:");
});

const iconName = computed(() => {
  if (!isElementPlusIcon.value) return "";
  return icon.value?.replace("el-icon-", "") || "";
});
</script>
