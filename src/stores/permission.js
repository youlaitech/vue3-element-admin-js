import { constantRoutes } from "@/router";
import { resolveComponent } from "@/router/views";
import { store } from "@/stores";
import router from "@/router";
import { useUserStoreHook } from "@/stores/user";
import { isExternal, joinRoutePath, resolveExternalUrl } from "@/utils";
import MenuAPI from "@/api/system/menu";
const Layout = () => import("../layouts/index.vue");
export const usePermissionStore = defineStore("permission", () => {
  const routes = ref([]);
  const mixLayoutSideMenus = ref([]);
  const isRouteGenerated = ref(false);
  /**
   * 生成动态路由
   */
  async function generateRoutes() {
    try {
      const routeData = await MenuAPI.getRoutes();
      const menuRoutes = buildRoutes(routeData);
      const registerRoutes = filterRoutes(menuRoutes);
      routes.value = [...constantRoutes, ...menuRoutes];
      isRouteGenerated.value = true;
      return registerRoutes;
    } catch (error) {
      isRouteGenerated.value = false;
      throw error;
    }
  }
  /**
   * 设置混合布局左侧菜单
   */
  const setMixLayoutSideMenus = (parentPath) => {
    const parentMenu = routes.value.find((item) => item.path === parentPath);
    mixLayoutSideMenus.value = parentMenu?.children || [];
  };
  /**
   * 移除已注册的动态路由（静态路由保留）
   */
  const removeDynamicRoutes = (routeList) => {
    const constantNames = new Set(constantRoutes.map((route) => route.name).filter(Boolean));
    routeList.forEach((route) => {
      if (route.name && !constantNames.has(route.name)) {
        router.removeRoute(route.name);
      }
    });
  };
  /**
   * 重置路由状态
   */
  const resetRouter = () => {
    removeDynamicRoutes(routes.value);
    routes.value = [...constantRoutes];
    mixLayoutSideMenus.value = [];
    isRouteGenerated.value = false;
  };
  let pendingReload = null;
  /**
   * 重新加载动态路由：并发复用同一请求，避免路由空窗
   */
  async function reloadRoutes() {
    if (pendingReload) return pendingReload;
    pendingReload = (async () => {
      try {
        const staleRoutes = [...routes.value];
        const dynamicRoutes = await generateRoutes();
        removeDynamicRoutes(staleRoutes);
        dynamicRoutes.forEach((route) => {
          router.addRoute(route);
        });
        mixLayoutSideMenus.value = [];
        return dynamicRoutes;
      } finally {
        pendingReload = null;
      }
    })();
    return pendingReload;
  }
  let pendingPermissionRefresh = null;
  /**
   * 刷新权限：重新拉取用户信息并重建动态路由
   */
  async function refreshPermissions() {
    if (pendingPermissionRefresh) return pendingPermissionRefresh;
    pendingPermissionRefresh = (async () => {
      try {
        const userStore = useUserStoreHook();
        await userStore.getUserInfo();
        await reloadRoutes();
      } finally {
        pendingPermissionRefresh = null;
      }
    })();
    return pendingPermissionRefresh;
  }
  return {
    routes,
    mixLayoutSideMenus,
    isRouteGenerated,
    generateRoutes,
    setMixLayoutSideMenus,
    resetRouter,
    reloadRoutes,
    refreshPermissions,
  };
});
// 目录菜单 component 的占位值，标记该级只作路由容器
const LAYOUT_COMPONENT = "Layout";
/**
 * 顶层统一套 Layout：目录即容器，页面下沉为 path 为空的子路由
 */
const buildRoutes = (menus) => menus.map(buildTopLevelRoute);
/**
 * 套 Layout 壳承载顶层菜单，使页面具备侧边栏与顶栏
 */
function buildTopLevelRoute(menu) {
  // 新标签页外链不注册路由，保留原始数据供侧边栏直接跳转
  const externalUrl = resolveMenuExternalUrl(menu);
  if (externalUrl) return toExternalRoute(menu, externalUrl);
  const path = joinRoutePath("", menu.path);
  const meta = { ...menu.meta };
  // 目录：自身就是侧边栏分组，标题与图标保留在壳层
  if (isContainer(menu)) {
    return {
      path,
      name: path,
      component: Layout,
      meta,
      redirect: menu.redirect || firstVisiblePath(menu.children, path),
      children: buildChildRoutes(menu.children, path),
    };
  }
  // 页面：标题与图标下沉到子路由，避免面包屑与标签页多出一层
  return {
    path,
    name: path,
    component: Layout,
    meta: { hidden: meta.hidden },
    children: [
      {
        path: "",
        name: menu.name,
        component: resolveComponent(menu.component),
        meta,
        children: buildChildRoutes(menu.children, path),
      },
    ],
  };
}
/**
 * 子级菜单路由：目录保留为路径分组，页面挂载实际组件
 */
function buildChildRoutes(menus, basePath) {
  return (menus ?? []).map((menu) => {
    const fullPath = joinRoutePath(basePath, menu.path);
    const externalUrl = resolveMenuExternalUrl(menu);
    if (externalUrl) return toExternalRoute(menu, externalUrl);
    if (isContainer(menu)) {
      const children = buildChildRoutes(menu.children, fullPath);
      return {
        path: menu.path ?? "",
        meta: { ...menu.meta },
        children,
        ...(children.length
          ? { redirect: menu.redirect || firstVisiblePath(menu.children, fullPath) }
          : {}),
      };
    }
    return {
      path: menu.path ?? "",
      name: menu.name,
      component: resolveComponent(menu.component),
      meta: { ...menu.meta },
    };
  });
}
/**
 * 新标签页外链：不注册路由，仅保留侧边栏跳转所需信息
 */
function toExternalRoute(menu, path) {
  const { children: _children, ...rest } = menu;
  return { ...rest, path };
}
/**
 * 外链地址：取 meta.externalUrl；存量数据的外链直接写在 path 上
 */
function resolveMenuExternalUrl(menu) {
  if (menu.component) return "";
  const externalUrl = menu.meta?.externalUrl;
  if (externalUrl) return resolveExternalUrl(externalUrl);
  const path = menu.path ?? "";
  return isExternal(path) ? path : "";
}
/**
 * 目录菜单：没有页面组件，只作路由容器
 */
function isContainer(menu) {
  return !menu.component || menu.component === LAYOUT_COMPONENT;
}
/**
 * 默认跳转：第一个非外链的可见子菜单完整路径
 */
function firstVisiblePath(menus, basePath) {
  const first = (menus ?? []).find((menu) => !menu.meta?.hidden && !resolveMenuExternalUrl(menu));
  return first ? joinRoutePath(basePath, first.path) : undefined;
}
/**
 * 过滤掉新标签页外链，仅保留可注册的路由
 */
function filterRoutes(routes) {
  return routes.reduce((result, route) => {
    if (isExternal(route.path)) return result;
    const filtered = { ...route };
    const children = route.children ? filterRoutes(route.children) : [];
    if (children.length > 0) {
      filtered.children = children;
    } else {
      delete filtered.children;
    }
    result.push(filtered);
    return result;
  }, []);
}
/**
 * 非组件环境获取 permission store
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
