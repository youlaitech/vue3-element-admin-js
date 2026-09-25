const members = [
  { id: 1, name: "张三", dept: "研发部", post: "前端开发" },
  { id: 2, name: "李四", dept: "研发部", post: "后端开发" },
  { id: 3, name: "王五", dept: "产品部", post: "产品经理" },
  { id: 4, name: "赵六", dept: "测试部", post: "测试工程师" },
  { id: 5, name: "钱七", dept: "运维部", post: "运维工程师" },
];
/**
 * 按姓名筛选，关键字为空时返回全部，返回副本避免调用方直接改源数据
 */
export function listMembers(keywords = "") {
  const keyword = keywords.trim();
  const matched = keyword ? members.filter((item) => item.name.includes(keyword)) : members;
  return matched.map((item) => ({ ...item }));
}
/**
 * 按 ID 取单条
 */
export function getMember(id) {
  const found = members.find((item) => item.id === id);
  return found ? { ...found } : undefined;
}
/**
 * 回写修改后的成员信息
 */
export function updateMember(item) {
  const index = members.findIndex((row) => row.id === item.id);
  if (index !== -1) members[index] = { ...item };
}
