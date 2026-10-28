/**
 * 将表头排序转为接口参数；清除时不发送空规则。
 */
export function buildSort(sort, field = sort.prop) {
  if (sort.order === null) return undefined;
  if (!field || field.includes(",")) throw new Error("排序列缺少有效的接口属性");
  return [`${field},${sort.order === "ascending" ? "asc" : "desc"}`];
}
