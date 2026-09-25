import request from "@/utils/request";
const DEPT_BASE_URL = "/api/v1/depts";
const DeptAPI = {
  /**
   * 获取部门树形列表
   */
  getList(queryParams) {
    return request({
      url: `${DEPT_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取部门下拉数据源
   */
  getOptions() {
    return request({ url: `${DEPT_BASE_URL}/options`, method: "get" });
  },
  /**
   * 获取部门表单数据
   */
  getFormData(id) {
    return request({ url: `${DEPT_BASE_URL}/${id}/form`, method: "get" });
  },
  /**
   * 新增部门
   */
  create(data) {
    return request({ url: `${DEPT_BASE_URL}`, method: "post", data });
  },
  /**
   * 修改部门
   */
  update(id, data) {
    return request({ url: `${DEPT_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 批量删除部门，多个以英文逗号(,)分割
   */
  deleteByIds(ids) {
    return request({ url: `${DEPT_BASE_URL}/${ids}`, method: "delete" });
  },
};
export default DeptAPI;
// 重导出类型
