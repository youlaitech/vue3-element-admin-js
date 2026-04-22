<template>
  <div class="page-container">
    <TableList ref="tableListRef" @generate="handleOpenDrawer" @reset-config="handleResetConfig" />

    <GeneratorDrawer ref="drawerRef" v-model:visible="drawerVisible" :title="drawerTitle" />
  </div>
</template>

<script setup>
defineOptions({ name: "Codegen" });

import TableList from "./components/TableList.vue";
import GeneratorDrawer from "./components/GeneratorDrawer.vue";

const drawerVisible = ref(false);
const drawerTitle = ref("");
const drawerRef = ref();
const tableListRef = ref();

function handleOpenDrawer(tableName) {
  drawerTitle.value = `${tableName} 代码生成`;
  drawerVisible.value = true;
  nextTick(() => {
    drawerRef.value?.open(tableName);
  });
}

function handleResetConfig(tableName) {
  tableListRef.value?.handleResetConfig(tableName);
}
</script>
