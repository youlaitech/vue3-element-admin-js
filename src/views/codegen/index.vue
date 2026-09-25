<template>
  <div class="page-container">
    <TableList ref="tableListRef" @generate="handleOpenDrawer" @reset-config="handleResetConfig" />

    <GeneratorDrawer ref="drawerRef" v-model:visible="drawerVisible" :title="drawerTitle" />
  </div>
</template>

<script setup>
defineOptions({ name: "Codegen" });
const drawerVisible = ref(false);
const drawerTitle = ref("");
const drawerRef = ref();
const tableListRef = ref();
/**
 * 打开代码生成抽屉
 */
function handleOpenDrawer(tableName) {
  drawerTitle.value = `${tableName} 代码生成`;
  drawerVisible.value = true;
  nextTick(() => {
    drawerRef.value?.open(tableName);
  });
}
/**
 * 重置指定表的生成配置
 */
function handleResetConfig(tableName) {
  tableListRef.value?.handleResetConfig(tableName);
}
</script>
