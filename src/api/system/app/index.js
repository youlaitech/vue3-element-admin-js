import request from "@/utils/request";
const APP_BASE_URL = "/api/v1/apps";
const AppAPI = {
  /**
   * 获取应用分页数据
   */
  getPage(queryParams) {
    return request({
      url: `${APP_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取应用表单数据
   */
  getFormData(id) {
    return request({
      url: `${APP_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /**
   * 新增应用
   */
  create(data) {
    return request({ url: `${APP_BASE_URL}`, method: "post", data });
  },
  /**
   * 修改应用
   */
  update(id, data) {
    return request({ url: `${APP_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 删除应用（多个 ID 以英文逗号分隔）
   */
  deleteByIds(ids) {
    return request({ url: `${APP_BASE_URL}/${ids}`, method: "delete" });
  },
  /**
   * 修改应用状态
   */
  updateStatus(id, status) {
    return request({ url: `${APP_BASE_URL}/${id}/status`, method: "put", data: { status } });
  },
};
export default AppAPI;
// 重导出类型
