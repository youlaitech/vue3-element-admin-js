import request from "@/utils/request";
const FORM_BASE_URL = "/api/v1/forms";
const FormAPI = {
  /**
   * 审批表单下拉选项（工作流设计器绑定表单用，仅已发布 workflow 类型）
   */
  getWorkflowOptions() {
    return request({
      url: `${FORM_BASE_URL}/options`,
      method: "get",
    });
  },
  /**
   * AI 生成表单规则（未开启 AI 时接口不存在）
   */
  aiGenerate(description) {
    return request({
      url: `${FORM_BASE_URL}/ai-generate`,
      method: "post",
      data: { description },
    });
  },
  /**
   * 表单定义分页列表
   */
  getPage(queryParams) {
    return request({
      url: FORM_BASE_URL,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 表单定义表单数据（编辑回显）
   */
  getFormData(id) {
    return request({
      url: `${FORM_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /**
   * 新增表单定义
   */
  create(data) {
    return request({ url: FORM_BASE_URL, method: "post", data });
  },
  /**
   * 修改表单定义（设计器保存规则）
   */
  update(id, data) {
    return request({ url: `${FORM_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 删除表单定义（ids 多个用逗号拼接）
   */
  deleteByIds(ids) {
    return request({ url: `${FORM_BASE_URL}/${ids}`, method: "delete" });
  },
  /**
   * 发布表单
   */
  publish(id) {
    return request({ url: `${FORM_BASE_URL}/${id}/publish`, method: "put" });
  },
  /**
   * 停用表单
   */
  disable(id) {
    return request({ url: `${FORM_BASE_URL}/${id}/disable`, method: "put" });
  },
  /**
   * 获取表单渲染规则（已发布）
   */
  getRender(formKey) {
    return request({
      url: `${FORM_BASE_URL}/${formKey}/render`,
      method: "get",
    });
  },
  /**
   * 获取公开表单渲染规则（匿名，Security 白名单接口）
   */
  getPublicRender(formKey) {
    return request({
      url: `${FORM_BASE_URL}/public/${formKey}/render`,
      method: "get",
      // 已登录管理员打开分享链接时不能混入自身令牌
      anonymous: true,
    });
  },
  /**
   * 匿名提交公开表单数据（后端按 formKey + IP 限流防刷）
   */
  submitPublicFormData(formKey, data) {
    return request({
      url: `${FORM_BASE_URL}/public/${formKey}/data`,
      method: "post",
      data,
      anonymous: true,
    });
  },
  /**
   * 表单数据分页列表
   */
  getFormDataPage(formKey, queryParams) {
    return request({
      url: `${FORM_BASE_URL}/${formKey}/data`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 提交表单数据
   */
  submitFormData(formKey, data) {
    return request({
      url: `${FORM_BASE_URL}/${formKey}/data`,
      method: "post",
      data,
    });
  },
  /**
   * 获取表单数据详情（只读回显，返回提交时版本的规则快照）
   */
  getFormDataDetail(formKey, dataId) {
    return request({
      url: `${FORM_BASE_URL}/${formKey}/data/${dataId}`,
      method: "get",
    });
  },
  /**
   * 删除表单数据（ids 多个用逗号拼接）
   */
  deleteFormData(formKey, ids) {
    return request({ url: `${FORM_BASE_URL}/${formKey}/data/${ids}`, method: "delete" });
  },
  /**
   * 获取表单菜单配置（发布向导回显）
   */
  getFormMenu(formId) {
    return request({
      url: `${FORM_BASE_URL}/${formId}/menu`,
      method: "get",
    });
  },
  /**
   * 生成/更新表单访问菜单（事务内建菜单并授权可见角色）
   */
  saveFormMenu(formId, data) {
    return request({ url: `${FORM_BASE_URL}/${formId}/menu`, method: "post", data });
  },
};
export default FormAPI;
// 重导出类型
