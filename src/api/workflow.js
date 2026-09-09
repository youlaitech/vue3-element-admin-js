import request from "@/utils/request";

const WORKFLOW_BASE_URL = "/api/v1/workflow";

/** 流程模型接口（设计器侧：模型 CRUD、XML、部署） */
const ModelAPI = {
  /**
   * 流程模型分页列表
   * @param {Object} queryParams 查询参数
   * @returns {Promise} 流程模型分页数据
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
   * @param {Object} data 流程模型表单数据
   * @returns {Promise} 新增结果
   */
  create(data) {
    return request({ url: `${WORKFLOW_BASE_URL}/models`, method: "post", data });
  },

  /**
   * 修改流程模型（标识创建后不可修改）
   * @param {string} modelId 流程模型ID
   * @param {Object} data 流程模型表单数据
   * @returns {Promise} 修改结果
   */
  update(modelId, data) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${modelId}`, method: "put", data });
  },

  /**
   * 删除流程模型（ids 多个用逗号拼接）
   * @param {string} ids 流程模型ID，多个以英文逗号(,)分割
   * @returns {Promise} 删除结果
   */
  deleteByIds(ids) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${ids}`, method: "delete" });
  },

  /**
   * 获取模型 BPMN XML（设计器回显）
   * @param {string} modelId 流程模型ID
   * @returns {Promise} BPMN XML
   */
  getXml(modelId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/models/${modelId}/xml`,
      method: "get",
    });
  },

  /**
   * 保存模型 BPMN XML（设计器产出）
   * @param {string} modelId 流程模型ID
   * @param {string} xml BPMN XML
   * @returns {Promise} 保存结果
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
   * @param {string} modelId 流程模型ID
   * @returns {Promise} 部署结果
   */
  deploy(modelId) {
    return request({ url: `${WORKFLOW_BASE_URL}/models/${modelId}/deploy`, method: "post" });
  },

  /**
   * 重置工作流数据（清空所有流程含自建的模型/定义/实例/历史与关联表单数据，重建初始演示流程）
   * @returns {Promise} 重置结果
   */
  resetDemo() {
    return request({ url: `${WORKFLOW_BASE_URL}/models/demo/reset`, method: "post" });
  },
};

/** 流程定义接口（发布产物管理，入口在「流程设计」页行内操作） */
const DefinitionAPI = {
  /**
   * 可发起流程列表（发起页下拉数据源）
   * @returns {Promise} 可发起流程列表
   */
  listStartable() {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/startable`,
      method: "get",
    });
  },

  /**
   * 流程审批阶段预览（发起页/审批弹窗展示流程走向与各环节办理人）
   * @param {string} definitionId 流程定义ID
   * @returns {Promise} 审批阶段列表
   */
  listStages(definitionId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/stages`,
      method: "get",
    });
  },

  /**
   * 获取流程定义 BPMN XML（流程图查看）
   * @param {string} definitionId 流程定义ID
   * @returns {Promise} BPMN XML
   */
  getXml(definitionId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/xml`,
      method: "get",
    });
  },

  /**
   * 启用/停用流程（停用后不可发起新流程，运行中的实例不受影响）
   * @param {string} definitionId 流程定义ID
   * @param {boolean} suspend true 停用，false 启用
   * @returns {Promise} 操作结果
   */
  updateState(definitionId, suspend) {
    return request({
      url: `${WORKFLOW_BASE_URL}/definitions/${definitionId}/state`,
      method: "put",
      data: { suspend },
    });
  },
};

/** 流程实例接口（发起、我的流程、详情、流程图、撤销/终止） */
const InstanceAPI = {
  /**
   * 发起流程（返回流程实例ID）
   * @param {Object} data 发起流程表单数据
   * @returns {Promise} 流程实例ID
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
   * @param {Object} queryParams 查询参数
   * @returns {Promise} 流程实例分页数据
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
   * @param {string} instanceId 流程实例ID
   * @returns {Promise} 流程图数据
   */
  getDiagram(instanceId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/diagram`,
      method: "get",
    });
  },

  /**
   * 获取流程实例详情
   * @param {string} instanceId 流程实例ID
   * @returns {Promise} 流程实例详情
   */
  getDetail(instanceId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}`,
      method: "get",
    });
  },

  /**
   * 撤销流程（仅发起人）
   * @param {string} instanceId 流程实例ID
   * @returns {Promise} 撤销结果
   */
  cancel(instanceId) {
    return request({ url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/cancel`, method: "put" });
  },

  /**
   * 终止流程（管理员）
   * @param {string} instanceId 流程实例ID
   * @param {string} [reason] 终止原因
   * @returns {Promise} 终止结果
   */
  terminate(instanceId, reason) {
    return request({
      url: `${WORKFLOW_BASE_URL}/instances/${instanceId}/terminate`,
      method: "put",
      params: { reason },
    });
  },
};

/** 流程任务接口（待办/已办、审批通过/驳回） */
const TaskAPI = {
  /**
   * 待办任务分页列表
   * @param {Object} queryParams 查询参数
   * @returns {Promise} 待办任务分页数据
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
   * @param {Object} queryParams 查询参数
   * @returns {Promise} 已办任务分页数据
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
   * @param {string} taskId 任务ID
   * @returns {Promise} 任务详情
   */
  getDetail(taskId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/tasks/${taskId}`,
      method: "get",
    });
  },

  /**
   * 获取驳回目标节点列表
   * @param {string} taskId 任务ID
   * @returns {Promise} 驳回目标节点列表
   */
  listRejectTargets(taskId) {
    return request({
      url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/reject-targets`,
      method: "get",
    });
  },

  /**
   * 审批通过
   * @param {string} taskId 任务ID
   * @param {Object} data 审批意见与流程变量
   * @returns {Promise} 审批结果
   */
  complete(taskId, data) {
    return request({ url: `${WORKFLOW_BASE_URL}/tasks/${taskId}/complete`, method: "put", data });
  },

  /**
   * 驳回
   * @param {string} taskId 任务ID
   * @param {Object} data 目标节点与驳回意见
   * @returns {Promise} 驳回结果
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
