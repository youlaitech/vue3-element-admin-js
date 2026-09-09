import request from "@/utils/request";

const FORM_BASE_URL = "/api/v1/forms";

const FormAPI = {
  /**
   * 审批表单下拉选项（工作流设计器绑定表单用，仅已发布 workflow 类型）
   * @returns {Promise} 表单选项列表
   */
  getWorkflowOptions() {
    return request({
      url: `${FORM_BASE_URL}/options`,
      method: "get",
    });
  },

  /**
   * 表单定义分页列表
   * @param {Object} queryParams 查询参数
   * @returns {Promise} 表单定义分页数据
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
   * @param {string} id 表单定义ID
   * @returns {Promise} 表单定义表单数据
   */
  getFormData(id) {
    return request({
      url: `${FORM_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /**
   * 新增表单定义
   * @param {Object} data 表单定义数据
   * @returns {Promise} 新增结果
   */
  create(data) {
    return request({ url: FORM_BASE_URL, method: "post", data });
  },

  /**
   * 修改表单定义（设计器保存规则）
   * @param {string} id 表单定义ID
   * @param {Object} data 表单定义数据
   * @returns {Promise} 修改结果
   */
  update(id, data) {
    return request({ url: `${FORM_BASE_URL}/${id}`, method: "put", data });
  },

  /**
   * 删除表单定义（ids 多个用逗号拼接）
   * @param {string} ids 表单定义ID，多个以英文逗号(,)分割
   * @returns {Promise} 删除结果
   */
  deleteByIds(ids) {
    return request({ url: `${FORM_BASE_URL}/${ids}`, method: "delete" });
  },

  /**
   * 发布表单
   * @param {string} id 表单定义ID
   * @returns {Promise} 发布结果
   */
  publish(id) {
    return request({ url: `${FORM_BASE_URL}/${id}/publish`, method: "put" });
  },

  /**
   * 停用表单
   * @param {string} id 表单定义ID
   * @returns {Promise} 停用结果
   */
  disable(id) {
    return request({ url: `${FORM_BASE_URL}/${id}/disable`, method: "put" });
  },

  /**
   * 获取表单渲染规则（已发布）
   * @param {string} formKey 表单标识
   * @returns {Promise} 表单渲染数据
   */
  getRender(formKey) {
    return request({
      url: `${FORM_BASE_URL}/${formKey}/render`,
      method: "get",
    });
  },

  /**
   * 获取公开表单渲染规则（匿名，Security 白名单接口）
   *
   * 匿名页显式跳过 token 注入，避免已登录管理员预览分享链接时携带身份
   *
   * @param {string} formKey 表单标识
   * @returns {Promise} 表单渲染数据
   */
  getPublicRender(formKey) {
    return request({
      url: `${FORM_BASE_URL}/public/${formKey}/render`,
      method: "get",
      headers: { Authorization: "no-auth" },
    });
  },

  /**
   * 匿名提交公开表单数据（后端按 formKey + IP 限流防刷）
   * @param {string} formKey 表单标识
   * @param {Object} data 表单数据（field -> value 映射）
   * @returns {Promise} 提交结果
   */
  submitPublicFormData(formKey, data) {
    return request({
      url: `${FORM_BASE_URL}/public/${formKey}/data`,
      method: "post",
      data,
      headers: { Authorization: "no-auth" },
    });
  },

  /**
   * 表单数据分页列表
   * @param {string} formKey 表单标识
   * @param {Object} queryParams 查询参数
   * @returns {Promise} 表单数据分页数据
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
   * @param {string} formKey 表单标识
   * @param {Object} data 表单数据（field -> value 映射）
   * @returns {Promise} 提交结果
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
   * @param {string} formKey 表单标识
   * @param {string} dataId 数据ID
   * @returns {Promise} 表单数据详情
   */
  getFormDataDetail(formKey, dataId) {
    return request({
      url: `${FORM_BASE_URL}/${formKey}/data/${dataId}`,
      method: "get",
    });
  },

  /**
   * 删除表单数据（ids 多个用逗号拼接）
   * @param {string} formKey 表单标识
   * @param {string} ids 数据ID，多个以英文逗号(,)分割
   * @returns {Promise} 删除结果
   */
  deleteFormData(formKey, ids) {
    return request({ url: `${FORM_BASE_URL}/${formKey}/data/${ids}`, method: "delete" });
  },

  /**
   * 获取表单菜单配置（发布向导回显）
   * @param {string} formId 表单定义ID
   * @returns {Promise} 菜单配置，未生成过入口时为 null
   */
  getFormMenu(formId) {
    return request({
      url: `${FORM_BASE_URL}/${formId}/menu`,
      method: "get",
    });
  },

  /**
   * 生成/更新表单访问菜单（事务内建菜单并授权可见角色）
   * @param {string} formId 表单定义ID
   * @param {Object} data 菜单配置
   * @returns {Promise} 保存结果
   */
  saveFormMenu(formId, data) {
    return request({ url: `${FORM_BASE_URL}/${formId}/menu`, method: "post", data });
  },
};

export default FormAPI;
