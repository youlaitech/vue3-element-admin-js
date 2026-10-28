<template>
  <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" />
  <form-create v-else v-model="formData" v-model:api="formApi" :rule="rule" :option="option" />
</template>

<script setup>
defineOptions({
  name: "FormDetail",
  inheritAttrs: false,
});

/**
 * 按提交时的快照只读回显表单，不使用设计器当前规则。
 * 同一组件切换快照时，重新解析规则、选项和数据。
 */
const props = defineProps({
  /** 表单规则（form-create rule 数组 JSON 字符串） */
  formJson: {
    type: String,
    default: "",
  },
  /** 表单全局配置 JSON 字符串 */
  optionsJson: {
    type: String,
    default: "",
  },
  /** 表单数据（field -> value 映射的 JSON 字符串） */
  dataJson: {
    type: String,
    default: "",
  },
});

const formApi = ref();
const loadError = ref("");
const formData = ref({});
// shallowRef：避免深代理破坏 Rule 内部的 Creator 结构
const rule = shallowRef([]);
const option = ref({ submitBtn: false, resetBtn: false });

watch(
  () => [props.formJson, props.optionsJson, props.dataJson],
  () => {
    // 每次先恢复默认选项，防止空快照沿用上一份配置。
    rule.value = [];
    option.value = { submitBtn: false, resetBtn: false };
    loadError.value = "";
    try {
      const rules = props.formJson ? JSON.parse(props.formJson) : [];
      const options = props.optionsJson ? JSON.parse(props.optionsJson) : {};
      if (
        !Array.isArray(rules) ||
        !options ||
        typeof options !== "object" ||
        Array.isArray(options)
      ) {
        throw new Error("Invalid form snapshot");
      }
      rule.value = disableRules(rules);
      option.value = { ...options, submitBtn: false, resetBtn: false };
    } catch {
      loadError.value = "表单快照格式有误，无法显示";
    }
    formData.value = parseDataJson(props.dataJson);
  },
  { immediate: true }
);

/**
 * 克隆快照后递归禁用控件，并移除只读态不需要的校验。
 * 不修改传入规则，避免影响其他使用同一快照的视图。
 */
function disableRules(rules) {
  /**
   * 递归禁用快照中的字段并移除校验规则。
   */
  const walk = (nodes) => {
    nodes.forEach((node) => {
      if (!node || typeof node !== "object") return;
      const item = node;
      item.props = { ...item.props, disabled: true };
      delete item.validate;
      if (Array.isArray(item.children)) {
        walk(item.children);
      }
    });
  };
  const cloned = structuredClone(rules);
  walk(cloned);
  return cloned;
}

/**
 * 数据必须是字段映射对象，非法 JSON、null 或数组均按空数据处理。
 */
function parseDataJson(dataJson) {
  try {
    const value = dataJson ? JSON.parse(dataJson) : undefined;
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
</script>
