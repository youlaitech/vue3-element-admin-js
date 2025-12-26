import { useDictStoreHook } from "@/store/modules/dict";
import { useStomp } from "./useStomp";

/**
 * 全局单例实例
 */
let singletonInstance = null;

/**
 * 创建字典同步组合式函数（内部工厂函数）
 */
function createDictSyncComposable() {
  const dictStore = useDictStoreHook();

  // 使用优化后的 useStomp
  const stomp = useStomp({
    reconnectDelay: 20000,
    connectionTimeout: 15000,
    useExponentialBackoff: false,
    maxReconnectAttempts: 3,
    autoRestoreSubscriptions: true, // 自动恢复订阅
    debug: false,
  });

  // 字典主题地址
  const DICT_TOPIC = "/topic/dict";

  // 消息回调函数列表
  const messageCallbacks = ref([]);

  // 订阅 ID（用于取消订阅）
  let subscriptionId = null;

  /**
   * 处理字典变更事件
   */
  const handleDictChangeMessage = (message) => {
    if (!message.body) {
      return;
    }

    try {
      const data = JSON.parse(message.body);
      const { dictCode } = data;

      if (!dictCode) {
        console.warn("[DictSync] 收到无效的字典变更消息：缺少 dictCode");
        return;
      }

      // 清除缓存，等待按需加载
      dictStore.removeDictItem(dictCode);

      // 执行所有注册的回调函数
      messageCallbacks.value.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("[DictSync] 回调函数执行失败:", error);
        }
      });
    } catch (error) {
      console.error("[DictSync] 解析字典变更消息失败:", error);
    }
  };

  /**
   * 初始化 WebSocket 连接并订阅字典主题
   */
  const initialize = () => {
    // 检查是否配置了 WebSocket 端点
    const wsEndpoint = import.meta.env.VITE_APP_WS_ENDPOINT;
    if (!wsEndpoint) {
      console.log("[DictSync] 未配置 WebSocket 端点，跳过字典同步功能");
      return;
    }

    // console.log("[DictSync] 初始化字典同步服务..."); // 高频日志已禁用

    // 连接 WebSocket 并订阅主题
    stomp
      .connect()
      .then(() => {
        // console.log("[DictSync] WebSocket 连接成功，开始订阅字典主题"); // 高频日志已禁用

        // 订阅字典变更主题
        subscriptionId = stomp.subscribe(DICT_TOPIC, handleDictChangeMessage);
      })
      .catch((error) => {
        console.error("[DictSync] WebSocket 连接失败:", error);
      });
  };

  /**
   * 清理 WebSocket 连接
   */
  const cleanup = () => {
    // console.log("[DictSync] 清理字典同步服务..."); // 高频日志已禁用

    // 取消订阅
    if (subscriptionId) {
      stomp.unsubscribe(subscriptionId);
      subscriptionId = null;
    }

    // 断开 WebSocket 连接
    stomp.disconnect();

    // 清空回调函数列表
    messageCallbacks.value = [];
  };

  /**
   * 添加字典变更事件监听器
   */
  const addChangeListener = (callback) => {
    messageCallbacks.value.push(callback);
  };

  /**
   * 移除字典变更事件监听器
   */
  const removeChangeListener = (callback) => {
    const index = messageCallbacks.value.indexOf(callback);
    if (index > -1) {
      messageCallbacks.value.splice(index, 1);
    }
  };

  /**
   * 获取连接状态
   */
  const isConnected = computed(() => stomp.isConnected.value);

  /**
   * 获取连接状态文本
   */
  const connectionStatus = computed(() => stomp.connectionStatus.value);

  return {
    initialize,
    cleanup,
    addChangeListener,
    removeChangeListener,
    isConnected,
    connectionStatus,
  };
}

/**
 * 字典同步组合式函数（单例模式）
 *
 * @description
 * 提供字典数据实时同步功能，当后端字典数据发生变更时，
 * 自动清除前端缓存并通知所有监听器
 *
 * @example
 * ```js
 * const dictSync = useDictSync();
 * dictSync.initialize();
 *
 * // 监听字典变更
 * dictSync.addChangeListener((message) => {
 *   console.log("字典变更:", message.dictCode);
 * });
 *
 * // 清理资源
 * dictSync.cleanup();
 * ```
 */
export function useDictSync() {
  if (!singletonInstance) {
    singletonInstance = createDictSyncComposable();
  }
  return singletonInstance;
}
