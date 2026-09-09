/**
 * 表单字段解析（规则字段提取、提交数据解析与展示格式化）
 */

/**
 * 递归提取表单字段元数据（布局容器的子节点递归收集）
 *
 * @param rules form-create 规则（JSON 解析产物，结构未校验）
 * @returns {Array<{field: string, title: string, optionMap: Map<string, string>}>} 字段元数据列表
 */
export function extractFields(rules) {
  const result = [];
  const walk = (nodes) => {
    nodes.forEach((node) => {
      if (!node || typeof node !== "object") return;
      if (typeof node.field === "string" && node.field) {
        result.push({
          field: node.field,
          title: String(node.title ?? node.field),
          optionMap: extractOptionMap(node.options),
        });
      }
      if (Array.isArray(node.children)) {
        walk(node.children);
      }
    });
  };
  walk(Array.isArray(rules) ? rules : []);
  return result;
}

/**
 * 提取字段选项映射（value -> label，脏项跳过）
 *
 * @param options 规则 options 数组
 * @returns {Map<string, string>} 选项映射
 */
export function extractOptionMap(options) {
  const optionMap = new Map();
  if (!Array.isArray(options)) return optionMap;
  options.forEach((option) => {
    if (!option || typeof option !== "object") return;
    const { value, label } = option;
    if (value !== undefined && label !== undefined) {
      optionMap.set(String(value), String(label));
    }
  });
  return optionMap;
}

/**
 * 解析提交数据（field -> value 映射，解析失败按空数据兜底）
 *
 * @param dataJson 数据 JSON 字符串
 * @returns {Object} 表单数据
 */
export function parseDataJson(dataJson) {
  try {
    return dataJson ? JSON.parse(dataJson) : {};
  } catch {
    return {};
  }
}

/**
 * 格式化单元格展示值（选项翻译、数组拼接、对象序列化、空值占位）
 *
 * @param value 字段值
 * @param field 字段元数据（选项类字段翻译 label，未命中原样展示）
 * @returns {string} 展示文本
 */
export function formatCellValue(value, field) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.map((item) => formatCellValue(item, field)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  const raw = String(value);
  return field?.optionMap.get(raw) ?? raw;
}
