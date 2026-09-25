import request from "@/utils/request";
const NOTICE_BASE_URL = "/api/v1/notices";
const NoticeAPI = {
  /**
   * 获取通知公告分页数据
   */
  getPage(queryParams) {
    return request({
      url: `${NOTICE_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取通知公告表单数据
   */
  getFormData(id) {
    return request({ url: `${NOTICE_BASE_URL}/${id}/form`, method: "get" });
  },
  /**
   * 添加通知公告
   */
  create(data) {
    return request({ url: `${NOTICE_BASE_URL}`, method: "post", data });
  },
  /**
   * 更新通知公告
   */
  update(id, data) {
    return request({ url: `${NOTICE_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 批量删除通知公告，多个以英文逗号(,)分割
   */
  deleteByIds(ids) {
    return request({ url: `${NOTICE_BASE_URL}/${ids}`, method: "delete" });
  },
  /**
   * 发布通知
   */
  publish(id) {
    return request({ url: `${NOTICE_BASE_URL}/${id}/publish`, method: "put" });
  },
  /**
   * 撤回通知
   */
  revoke(id) {
    return request({ url: `${NOTICE_BASE_URL}/${id}/revoke`, method: "put" });
  },
  /**
   * 查看通知
   */
  getDetail(id) {
    return request({
      url: `${NOTICE_BASE_URL}/${id}/detail`,
      method: "get",
    });
  },
  /**
   * 全部已读
   */
  readAll() {
    return request({ url: `${NOTICE_BASE_URL}/read-all`, method: "put" });
  },
  /**
   * 获取我的通知分页列表
   */
  getMyNoticePage(queryParams) {
    return request({
      url: `${NOTICE_BASE_URL}/my`,
      method: "get",
      params: queryParams,
    });
  },
};
export default NoticeAPI;
// 重导出类型
