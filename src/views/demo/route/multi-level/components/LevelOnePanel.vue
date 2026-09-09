<template>
  <el-alert :closable="false" title="一级菜单内容片段" />
</template>

<script setup>
defineOptions({ name: "LevelOnePanel" });

onMounted(() => {
  console.log("MultiLevel1 mounted");
});
</script>
