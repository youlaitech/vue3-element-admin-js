// 表单规则加载与渲染状态
// 填写页（render）、公开页（share）、预览页（preview）共用同一渲染管线
import { ref, shallowRef } from "vue";
/**
 * 加载表单规则并管理渲染状态
 *
 * @param loader 规则加载函数（各承载页的规则来源不同：草稿定义 / 已发布规则 / 公开规则）
 */
export function useFormRenderer(loader) {
  // shallowRef：深响应式代理会破坏 form-create Rule 内部 Creator 结构
  const rule = shallowRef([]);
  const option = shallowRef({ submitBtn: true });
  const loading = ref(false);
  const submitted = ref(false);
  /**
   * 加载并解析规则
   *
   * @returns 接口原始数据
   */ async function load() {
    loading.value = true;
    try {
      const data = await loader();
      rule.value = data?.formJson ? JSON.parse(data.formJson) : [];
      const parsedOption = data?.optionsJson ? JSON.parse(data.optionsJson) : {};
      // 强制开启提交按钮：填写页必须有提交入口，设计器保存时可能关掉了它
      option.value = { ...parsedOption, submitBtn: true };
      return data ?? undefined;
    } finally {
      loading.value = false;
    }
  }
  /**
   * 回到填写态（已填数据清空由 FormRenderer 处理）
   */
  function refill() {
    submitted.value = false;
  }
  return { rule, option, loading, submitted, load, refill };
}
