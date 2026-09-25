import request from "@/utils/request";
const WORKFLOW_BASE_URL = "/api/v1/workflow";
/**
 * 流程模型接口（设计器侧使用）
 */
const ModelAPI = {
  /**
   * 流程模型分页列表
   */
  getPage(queryParams) {
    return request({
      url: `${WORKFLOW_BASE_URL}/models`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 新增流程模型（内置开始-审批-结束模板）
   */
  create(data) {
    return request({ url: `${WORKFLOW_BASE_URL}/models`, method: "post", data });
  },
  /**
   * 修改流程模型（标识创建后不可修改）
   */
  update(modelId, data) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${modelId}`, method: "put", data });
  },
  /**
   * 删除流程模型（ids 多个用逗号拼接）
   */
  deleteByIds(ids) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${ids}`, method: "delete" });
  },
  /**
   * 获取模型 BPMN XML（设计器回显）
   */
  getXml(modelId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/models/${modelId}/xml`,
      method: "get",
    });
  },
  /**
   * 保存模型 BPMN XML（设计器产出）
   */
  saveXml(modelId, xml) {
    return request({
      url: `${WORKFLOW_BASE_URL}/models/${modelId}/xml`,
      method: "put",
      data: { xml },
    });
  },
  /**
   * 部署流程模型（发布为流程定义新版本）
   */
  deploy(modelId) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${modelId}/deploy`, method: "post" });
  },
  /**
   * 重置工作流数据（清空所有流程含自建的模型/定义/实例/历史与关联表单数据，重建初始演示流程）
   */
  resetDemo() {
    return request({ url: `${WORKFLOW_BASE_URL}/models/demo/reset`, method: "post" });
  },
};
/**
 * 流程定义接口（发布产物管理，入口在「流程设计」页行内操作）
 */
const DefinitionAPI = {
  /**
   * 可发起流程列表（发起页下拉数据源）
   */
  listStartable() {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/startable`,
      method: "get",
    });
  },
  /**
   * 流程审批阶段预览（发起页/审批弹窗展示流程走向与各环节办理人）
   */
  listStages(definitionId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/stages`,
      method: "get",
    });
  },
  /**
   * 获取流程定义 BPMN XML（流程图查看）
   */
  getXml(definitionId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/xml`,
      method: "get",
    });
  },
  /**
   * 启用/停用流程（停用后不可发起新流程，运行中的实例不受影响）
   */
  updateState(definitionId, suspend) {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/state`,
      method: "put",
      data: { suspend },
    });
  },
};
/**
 * 流程实例接口
 */
const InstanceAPI = {
  /**
   * 发起流程（返回流程实例 ID）
   */
  start(data) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances`,
      method: "post",
      data,
    });
  },
  /**
   * 我的流程分页列表
   */
  getPage(queryParams) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取流程图数据（节点高亮）
   */
  getDiagram(instanceId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/diagram`,
      method: "get",
    });
  },
  /**
   * 获取流程实例详情
   */
  getDetail(instanceId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}`,
      method: "get",
    });
  },
  /**
   * 撤销流程（仅发起人）
   */
  cancel(instanceId) {
    return request({ url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/cancel`, method: "put" });
  },
  /**
   * 终止流程（管理员）
   */
  terminate(instanceId, reason) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/terminate`,
      method: "put",
      params: { reason },
    });
  },
};
/**
 * 流程任务接口
 */
const TaskAPI = {
  /**
   * 待办任务分页列表
   */
  getTodoPage(queryParams) {
    return request({
      url: `${WORKFLOW_BASE_URL}/tasks/todo`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 已办任务分页列表
   */
  getDonePage(queryParams) {
    return request({
      url: `${WORKFLOW_BASE_URL}/tasks/done`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取待办任务详情（发起表单回显 + 审批记录）
   */
  getDetail(taskId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/tasks/${taskId}`,
      method: "get",
    });
  },
  /**
   * AI 生成任务审批摘要（未开启 AI 时接口不存在）
   */
  aiSummary(taskId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/ai-summary`,
      method: "post",
    });
  },
  /**
   * 获取驳回目标节点列表
   */
  listRejectTargets(taskId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/reject-targets`,
      method: "get",
    });
  },
  /**
   * 审批通过
   */
  complete(taskId, data) {
    return request({ url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/complete`, method: "put", data });
  },
  /**
   * 驳回
   */
  reject(taskId, data) {
    return request({ url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/reject`, method: "put", data });
  },
};
const WorkflowAPI = {
  model: ModelAPI,
  definition: DefinitionAPI,
  instance: InstanceAPI,
  task: TaskAPI,
};
export default WorkflowAPI;
// 重导出类型
