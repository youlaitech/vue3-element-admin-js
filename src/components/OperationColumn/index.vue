<template>
  <el-table-column :prop :label :fixed :align :show-overflow-tooltip :width="finalWidth">
    <template #default="{ row }">
      <div v-auto class="operation-button">
        <slot :row="row" />
      </div>
    </template>
  </el-table-column>
</template>

<script setup>
const props = defineProps({
  /** 表格数据长度（用于性能优化，避免多次计算宽度） */
  listDataLength: {
    type: Number,
    default: 0,
  },
  prop: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "操作",
  },
  fixed: {
    type: String,
    default: "right",
  },
  align: {
    type: String,
    default: "center",
  },
  showOverflowTooltip: {
    type: Boolean,
    default: false,
  },
  /** 最小宽度，优先级高于自动计算宽度，默认 80px */
  minWidth: {
    type: Number,
    default: 80,
  },
});
const count = ref(0);
const maxWidth = ref(80);
/**
 * 按列数计算操作列宽度
 */
const calculateWidth = () => {
  count.value++;
  if (count.value !== props.listDataLength) return;
  let totalWidth = 0;
  maxWidth.value = 80; // 重置为初始值
  const els = document.getElementsByClassName("operation-button");
  Array.from(els).forEach((el) => {
    const buttons = el.querySelectorAll(".el-button");
    totalWidth = Array.from(buttons).reduce((prev, button) => {
      // 14 是按钮之间的距离
      // 组成：按钮的左边距(Element Plus 默认为 12px)+按钮的 padding(Element Plus 默认为 2px)
      return prev + button.scrollWidth + 14;
    }, 24); // 24 是左右内边距
    maxWidth.value = Math.max(maxWidth.value, totalWidth);
  });
  count.value = 0;
};
const vAuto = {
  mounted: () => {
    // 初次挂载的时候计算一次
    calculateWidth();
  },
  updated: () => {
    // 数据更新时重新计算一次
    calculateWidth();
  },
};
const finalWidth = computed(() => {
  return props.minWidth || maxWidth.value;
});
</script>
