import { store } from "@/stores";
import DictAPI from "@/api/system/dict";
import { STORAGE_KEYS } from "@/constants";
import { useSse } from "@/utils/sse";
import { SseTopics } from "@/enums/sse";
export const useDictStore = defineStore("dict", () => {
  // 字典数据缓存
  const dictCache = useStorage(STORAGE_KEYS.DICT_CACHE, {});
  // 请求队列（防止重复请求）
  const requestQueue = {};
  /**
   * 缓存字典数据
   *
   * @param dictCode 字典编码
   * @param data 字典项列表
   */ const cacheDictItems = (dictCode, data) => {
    dictCache.value[dictCode] = data;
  };
  /**
   * 加载字典数据（如果缓存中没有则请求）
   *
   * @param dictCode 字典编码
   */ const loadDictItems = async (dictCode) => {
    if (dictCache.value[dictCode]) return;
    // 防止重复请求
    if (!requestQueue[dictCode]) {
      requestQueue[dictCode] = DictAPI.getDictItems(dictCode)
        .then((data) => {
          cacheDictItems(dictCode, data);
          Reflect.deleteProperty(requestQueue, dictCode);
        })
        .catch((error) => {
          // 请求失败，清理队列，允许重试
          Reflect.deleteProperty(requestQueue, dictCode);
          throw error;
        });
    }
    await requestQueue[dictCode];
  };
  /**
   * 获取字典项列表
   *
   * @param dictCode 字典编码
   * @returns 字典项列表
   */ const getDictItems = (dictCode) => {
    return dictCache.value[dictCode] || [];
  };
  /**
   * 移除指定字典项
   *
   * @param dictCode 字典编码
   */ const removeDictItem = (dictCode) => {
    if (dictCache.value[dictCode]) {
      Reflect.deleteProperty(dictCache.value, dictCode);
    }
  };
  /**
   * 清空字典缓存
   */
  const clearDictCache = () => {
    dictCache.value = {};
  };
  // ---------- SSE 字典同步 ----------
  // 字典变更回调列表（供页面在缓存失效时执行自定义逻辑）
  const dictChangeCallbacks = [];
  let unsubscribeDictChange = null;
  /**
   * 处理字典变更消息：清除指定字典缓存，并通知所有已注册回调
   *
   * @param message SSE 推送的字典变更消息
   */ const handleDictChange = (message) => {
    const { dictCode } = message;
    if (!dictCode) {
      console.warn("[DictStore] 收到无效的字典变更消息：缺少 dictCode");
      return;
    }
    removeDictItem(dictCode);
    dictChangeCallbacks.forEach((cb) => {
      try {
        cb(message);
      } catch (err) {
        console.error("[DictStore] 字典变更回调执行失败:", err);
      }
    });
  };
  /**
   * 订阅 SSE 字典变更事件（幂等：重复调用不会产生重复订阅）
   */
  const setupDictSync = () => {
    if (unsubscribeDictChange) return;
    unsubscribeDictChange = useSse().on(SseTopics.DICT, handleDictChange);
  };
  /**
   * 取消 SSE 字典订阅并清空所有回调
   */
  const teardownDictSync = () => {
    unsubscribeDictChange?.();
    unsubscribeDictChange = null;
    dictChangeCallbacks.length = 0;
  };
  /**
   * 注册字典变更回调，返回取消注册函数
   *
   * @param cb 字典变更回调
   */ const onDictChange = (cb) => {
    dictChangeCallbacks.push(cb);
    return () => {
      const idx = dictChangeCallbacks.indexOf(cb);
      if (idx !== -1) dictChangeCallbacks.splice(idx, 1);
    };
  };
  return {
    loadDictItems,
    getDictItems,
    removeDictItem,
    clearDictCache,
    setupDictSync,
    teardownDictSync,
    onDictChange,
  };
});
/**
 * 在组件外拿 dict store 实例
 */
export function useDictStoreHook() {
  return useDictStore(store);
}
