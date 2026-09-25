<template>
  <form-create v-model="formData" v-model:api="formApi" :rule="rule" :option="option" />
</template>

<script setup>
defineOptions({
  name: "FormDetail",
  inheritAttrs: false,
});
/**
 * 表单只读回显
 * 按提交时快照规则渲染表单并禁用全部控件，
 * 供审批办理、实例详情等场景回看发起数据
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
const formData = ref({});
// shallowRef：避免深代理破坏 Rule 内部的 Creator 结构
const rule = shallowRef([]);
const option = ref({ submitBtn: false, resetBtn: false });
watch(
  () => [props.formJson, props.optionsJson, props.dataJson],
  () => {
    rule.value = props.formJson ? disableRules(JSON.parse(props.formJson)) : [];
    if (props.optionsJson) {
      option.value = { ...JSON.parse(props.optionsJson), submitBtn: false, resetBtn: false };
    }
    formData.value = parseDataJson(props.dataJson);
  },
  { immediate: true }
);
/**
 * 递归禁用规则中的全部控件
 * 同时移除校验规则，只读态不展示必填星号
 *
 * @param rules form-create 规则（JSON 解析值）
 */
function disableRules(rules) {
  // 递归遍历节点
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
  walk(Array.isArray(cloned) ? cloned : []);
  return cloned;
}
/**
 * 解析表单数据（解析失败按空数据兜底）
 *
 * @param dataJson 数据 JSON 字符串
 */
function parseDataJson(dataJson) {
  try {
    return dataJson ? JSON.parse(dataJson) : {};
  } catch {
    return {};
  }
}
</script>
