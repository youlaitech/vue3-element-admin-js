import request from "@/utils/request";
const ROLE_BASE_URL = "/api/v1/roles";
const RoleAPI = {
  /**
   * 获取角色分页数据
   */
  getPage(queryParams) {
    return request({
      url: `${ROLE_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取角色下拉数据源
   */
  getOptions() {
    return request({ url: `${ROLE_BASE_URL}/options`, method: "get" });
  },
  /**
   * 获取角色编码下拉数据源（value 为角色编码，供流程候选组等场景）
   */
  getCodeOptions() {
    return request({ url: `${ROLE_BASE_URL}/code-options`, method: "get" });
  },
  /**
   * 获取角色的菜单 ID 集合
   */
  getRoleMenuIds(roleId) {
    return request({
      url: `${ROLE_BASE_URL}/${roleId}/menu-ids`,
      method: "get",
    });
  },
  /**
   * 分配菜单权限
   */
  updateRoleMenus(roleId, data) {
    return request({ url: `${ROLE_BASE_URL}/${roleId}/menus`, method: "put", data });
  },
  /**
   * 获取角色表单数据
   */
  getFormData(id) {
    return request({ url: `${ROLE_BASE_URL}/${id}/form`, method: "get" });
  },
  /**
   * 获取角色的部门 ID 集合(自定义数据权限)
   */
  getRoleDeptIds(roleId) {
    return request({
      url: `${ROLE_BASE_URL}/${roleId}/dept-ids`,
      method: "get",
    });
  },
  /**
   * 新增角色
   */
  create(data) {
    return request({ url: `${ROLE_BASE_URL}`, method: "post", data });
  },
  /**
   * 更新角色
   */
  update(id, data) {
    return request({ url: `${ROLE_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 批量删除角色，多个以英文逗号(,)分割
   */
  deleteByIds(ids) {
    return request({ url: `${ROLE_BASE_URL}/${ids}`, method: "delete" });
  },
};
export default RoleAPI;
// 重导出类型
