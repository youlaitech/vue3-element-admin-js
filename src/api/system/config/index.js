import request from "@/utils/request";
const CONFIG_BASE_URL = "/api/v1/configs";
const ConfigAPI = {
  /**
   * 获取配置分页数据
   */
  getPage(queryParams) {
    return request({
      url: `${CONFIG_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取配置表单数据
   */
  getFormData(id) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /**
   * 新增配置
   */
  create(data) {
    return request({ url: `${CONFIG_BASE_URL}`, method: "post", data });
  },
  /**
   * 修改配置
   */
  update(id, data) {
    return request({ url: `${CONFIG_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 删除配置
   */
  deleteById(id) {
    return request({ url: `${CONFIG_BASE_URL}/${id}`, method: "delete" });
  },
  /**
   * 刷新配置缓存
   */
  refreshCache() {
    return request({ url: `${CONFIG_BASE_URL}/refresh`, method: "PUT" });
  },
};
export default ConfigAPI;
// 重导出类型
