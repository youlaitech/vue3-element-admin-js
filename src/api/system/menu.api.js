import request from "@/utils/request";
// 菜单基础URL
const MENU_BASE_URL = "/api/v1/menus";

const isExternalLink = (routePath) => {
  if (!routePath) return false;
  return /^https?:\/\//i.test(routePath);
};

const mapTypeFromBackend = (type, routePath) => {
  if (type === "C") return 2;
  if (type === "B") return 4;
  return isExternalLink(routePath) ? 3 : 1;
};

const mapTypeToBackend = (type) => {
  if (type === undefined || type === null) return undefined;
  if (type === 2) return "C";
  if (type === 4) return "B";
  return "M";
};

const mapMenuItemFromBackend = (item) => {
  const mapped = { ...item };
  if (typeof item?.type === "string") {
    mapped.type = mapTypeFromBackend(item.type, item.routePath);
  }
  if (Array.isArray(item?.children) && item.children.length) {
    mapped.children = item.children.map(mapMenuItemFromBackend);
  }
  return mapped;
};

const mapMenuListFromBackend = (data) => {
  return (data || []).map(mapMenuItemFromBackend);
};

const mapMenuFormFromBackend = (data) => {
  if (!data) return data;
  if (typeof data?.type === "string") {
    return { ...data, type: mapTypeFromBackend(data.type, data.routePath) };
  }
  return data;
};

const mapMenuFormToBackend = (data) => {
  const payload = { ...data };
  payload.type = mapTypeToBackend(data?.type);
  return payload;
};

const MenuAPI = {
  /**
   * 获取当前用户的路由列表
   * <p/>
   * 无需传入角色，后端解析token获取角色自行判断是否拥有路由的权限
   * @returns {Promise} 路由列表
   */
  getRoutes() {
    return request({
      url: `${MENU_BASE_URL}/routes`,
      method: "get",
    });
  },

  /**
   * 获取菜单树形列表
   * @param {Object} queryParams 查询参数
   * @returns {Promise} 菜单树形列表
   */
  getList(queryParams) {
    return request({
      url: `${MENU_BASE_URL}`,
      method: "get",
      params: queryParams,
    }).then((data) => mapMenuListFromBackend(data));
  },

  /**
   * 获取菜单下拉数据源
   * @param {boolean} [onlyParent] 是否只获取父级菜单
   * @returns {Promise} 菜单下拉数据源
   */
  getOptions(onlyParent) {
    return request({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
      params: { onlyParent: onlyParent },
    });
  },

  /**
   * 获取菜单表单数据
   * @param {string} id 菜单ID
   * @returns {Promise} 菜单表单数据
   */
  getFormData(id) {
    return request({
      url: `${MENU_BASE_URL}/${id}/form`,
      method: "get",
    }).then((data) => mapMenuFormFromBackend(data));
  },

  /**
   * 添加菜单
   * @param {Object} data 菜单表单数据
   * @returns {Promise} 请求结果
   */
  create(data) {
    return request({
      url: `${MENU_BASE_URL}`,
      method: "post",
      data: mapMenuFormToBackend(data),
    });
  },

  /**
   * 修改菜单
   * @param {string} id 菜单ID
   * @param {Object} data 菜单表单数据
   * @returns {Promise} 请求结果
   */
  update(id, data) {
    return request({
      url: `${MENU_BASE_URL}/${id}`,
      method: "put",
      data: mapMenuFormToBackend(data),
    });
  },

  /**
   * 删除菜单
   * @param {string} id 菜单ID
   * @returns {Promise} 请求结果
   */
  deleteById(id) {
    return request({
      url: `${MENU_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default MenuAPI;
