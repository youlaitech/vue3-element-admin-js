import request from "@/utils/request";
const DICT_BASE_URL = "/api/v1/dicts";
/**
 * 标签样式以语义全称（primary/success/warning/danger/info）存储，单字母是历史数据，这里兼容读取
 */
const decodeDictTagType = (code) => {
  const val = String(code ?? "")
    .trim()
    .toUpperCase();
  switch (val) {
    case "P":
    case "PRIMARY":
      return "primary";
    case "S":
    case "SUCCESS":
      return "success";
    case "W":
    case "WARNING":
      return "warning";
    case "I":
    case "INFO":
      return "info";
    case "D":
    case "DANGER":
    case "ERROR":
      return "danger";
    case "N":
    case "DEFAULT":
    default:
      return "";
  }
};
/**
 * 统一转换字典项标签类型
 */
const normalizeDictTagType = (item) => ({
  ...item,
  tagType: decodeDictTagType(item.tagType),
});
const DictAPI = {
  // 字典相关接口
  /**
   * 字典分页列表
   */
  getPage(queryParams) {
    return request({
      url: `${DICT_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 字典列表
   */
  getList() {
    return request({ url: `${DICT_BASE_URL}/options`, method: "get" });
  },
  /**
   * 字典表单数据
   */
  getFormData(id) {
    return request({ url: `${DICT_BASE_URL}/${id}/form`, method: "get" });
  },
  /**
   * 新增字典
   */
  create(data) {
    return request({ url: `${DICT_BASE_URL}`, method: "post", data });
  },
  /**
   * 修改字典
   */
  update(id, data) {
    return request({ url: `${DICT_BASE_URL}/${id}`, method: "put", data });
  },
  /**
   * 删除字典
   */
  deleteByIds(ids) {
    return request({ url: `${DICT_BASE_URL}/${ids}`, method: "delete" });
  },
  // 字典项相关接口
  /**
   * 获取字典项分页列表
   */
  getDictItemPage(dictCode, queryParams) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "get",
      params: queryParams,
    }).then((data) => ({
      ...data,
      list: (data.list ?? []).map(normalizeDictTagType),
    }));
  },
  /**
   * 获取字典项列表
   */
  getDictItems(dictCode) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/options`,
      method: "get",
    }).then((items) => (items ?? []).map(normalizeDictTagType));
  },
  /**
   * 新增字典项
   */
  createDictItem(dictCode, data) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items`,
      method: "post",
      data,
    });
  },
  /**
   * 获取字典项表单数据
   */
  getDictItemFormData(dictCode, id) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}/form`,
      method: "get",
    }).then(normalizeDictTagType);
  },
  /**
   * 修改字典项
   */
  updateDictItem(dictCode, id, data) {
    return request({
      url: `${DICT_BASE_URL}/${dictCode}/items/${id}`,
      method: "put",
      data,
    });
  },
  /**
   * 删除字典项
   */
  deleteDictItems(dictCode, ids) {
    return request({ url: `${DICT_BASE_URL}/${dictCode}/items/${ids}`, method: "delete" });
  },
};
export default DictAPI;
// 重导出类型
