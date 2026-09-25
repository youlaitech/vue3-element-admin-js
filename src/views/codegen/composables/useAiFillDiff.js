import { cloneDeep } from "lodash-es";
import { FormTypeEnum, QueryTypeEnum } from "@/enums/codegen";
// 参与比对的字段属性，顺序与字段配置表格一致
const FIELD_ITEMS = [
  { key: "fieldComment", label: "字段描述", format: text },
  { key: "isShowInQuery", label: "查询条件", format: switchText },
  { key: "queryType", label: "查询方式", format: (value) => enumLabel(QueryTypeEnum, value) },
  { key: "isShowInList", label: "列表显示", format: switchText },
  { key: "isShowInForm", label: "表单显示", format: switchText },
  { key: "formType", label: "表单类型", format: (value) => enumLabel(FormTypeEnum, value) },
  { key: "dictType", label: "字典类型", format: text },
  { key: "isRequired", label: "必填", format: switchText },
];
/**
 * 空值显示为「空」，避免差异明细里出现空白
 */
function text(value) {
  return value == null || value === "" ? "空" : String(value);
}
/**
 * 0/1 开关值转文本
 */
function switchText(value) {
  return value === 1 ? "是" : "否";
}
/**
 * 枚举值转中文名，匹配不到时保留原值
 */
function enumLabel(options, value) {
  if (value == null) return "-";
  const hit = Object.values(options).find((item) => item.value === value);
  return hit?.label ?? String(value);
}
/**
 * 对比两份配置，只保留发生变化的部分
 */
export function diffGenConfig(before, after) {
  const diff = { fields: [], fieldCount: 0, changeCount: 0 };
  if ((before.businessName ?? "") !== (after.businessName ?? "")) {
    diff.businessName = {
      label: "业务名",
      from: text(before.businessName),
      to: text(after.businessName),
    };
    diff.changeCount++;
  }
  const beforeFields = new Map(
    (before.fieldConfigs ?? []).map((field) => [field.columnName, field])
  );
  (after.fieldConfigs ?? []).forEach((field) => {
    const origin = beforeFields.get(field.columnName);
    if (!origin) return;
    const changes = [];
    FIELD_ITEMS.forEach(({ key, label, format }) => {
      const from = format(origin[key]);
      const to = format(field[key]);
      if (from !== to) changes.push({ label, from, to });
    });
    if (changes.length) {
      diff.fields.push({ columnName: field.columnName ?? "", changes });
      diff.fieldCount++;
      diff.changeCount += changes.length;
    }
  });
  return diff;
}
/**
 * AI 填充差异：填充前留快照，填充后算差异，支持撤销
 */
export function useAiFillDiff() {
  const aiDiff = ref(null);
  let snapshot = null;
  // 字段改动映射，供字段表格按列名标记
  const fieldChanges = computed(() => {
    const map = {};
    (aiDiff.value?.fields ?? []).forEach((field) => {
      map[field.columnName] = field.changes;
    });
    return map;
  });
  // 改动明细拍平成表格行，同一字段的多条改动带上合并标记
  const changeRows = computed(() =>
    (aiDiff.value?.fields ?? []).flatMap((field) =>
      field.changes.map((item, index) => ({
        columnName: field.columnName,
        fieldChangeCount: field.changes.length,
        first: index === 0,
        ...item,
      }))
    )
  );
  /**
   * 丢弃差异与快照
   */
  function clear() {
    snapshot = null;
    aiDiff.value = null;
  }
  /**
   * 记录填充前的配置
   */
  function snapshotConfig(config) {
    snapshot = cloneDeep(config);
    aiDiff.value = null;
  }
  /**
   * 计算与填充前的差异
   */
  function resolveDiff(filled) {
    const diff = snapshot
      ? diffGenConfig(snapshot, filled)
      : { fields: [], fieldCount: 0, changeCount: 0 };
    aiDiff.value = diff;
    return diff;
  }
  /**
   * 恢复填充前的配置并清空差异
   */
  function undo() {
    if (!snapshot) return null;
    const config = cloneDeep(snapshot);
    clear();
    return config;
  }
  return { aiDiff, fieldChanges, changeRows, clear, snapshotConfig, resolveDiff, undo };
}
