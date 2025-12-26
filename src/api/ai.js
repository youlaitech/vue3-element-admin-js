import request from "@/utils/request";

const AI_BASE_URL = "/api/v1/ai/assistant";

/**
 * AI 命令 API
 */
const AiCommandApi = {
  /**
   * 解析 AI 命令
   *
   * @param data AI 命令请求参数
   * @returns AI 命令解析响应
   */
  parseCommand(data) {
    return request({
      url: `${AI_BASE_URL}/parse`,
      method: "post",
      data,
    });
  },

  /**
   * 执行 AI 命令
   *
   * @param data AI 命令执行请求
   * @returns AI 命令执行响应
   */
  executeCommand(data) {
    return request({
      url: `${AI_BASE_URL}/execute`,
      method: "post",
      data,
    });
  },

  /**
   * 获取 AI 命令记录分页列表
   *
   * @param queryParams 查询参数
   * @returns AI 命令记录分页列表
   */
  getPage(queryParams) {
    return request({
      url: `${AI_BASE_URL}/records`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 删除 AI 命令记录
   *
   * @param ids 记录ID，多个以逗号分隔
   * @returns 删除结果
   */
  deleteByIds(ids) {
    return request({
      url: `${AI_BASE_URL}/records/${ids}`,
      method: "delete",
    });
  },
};

export default AiCommandApi;
