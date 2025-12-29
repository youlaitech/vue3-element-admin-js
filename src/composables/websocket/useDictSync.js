import { ref } from "vue";
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

    // 建立 WebSocket 连接
    stomp.connect();

    // 订阅字典主题（useStomp 会自动处理重连后的订阅恢复）
    subscriptionId = stomp.subscribe(DICT_TOPIC, handleDictChangeMessage);
  };

  /**
   * 关闭 WebSocket 连接并清理资源
   */
  const cleanup = () => {
    // 取消订阅（如果有的话）
    if (subscriptionId) {
      stomp.unsubscribe(subscriptionId);
      subscriptionId = null;
    }

    // 也可以通过主题地址取消订阅
    stomp.unsubscribeDestination(DICT_TOPIC);

    // 断开连接
    stomp.disconnect();

    // 清空回调列表
    messageCallbacks.value = [];
  };

  /**
   * 注册字典变更回调函数
   *
   * @param callback 回调函数
   * @returns 返回一个取消注册的函数
   */
  const onDictChange = (callback) => {
    messageCallbacks.value.push(callback);

    // 返回取消注册的函数
    return () => {
      const index = messageCallbacks.value.indexOf(callback);
      if (index !== -1) {
        messageCallbacks.value.splice(index, 1);
      }
    };
  };

  return {
    // 状态
    isConnected: stomp.isConnected,
    connectionState: stomp.connectionState,

    // 方法
    initialize,
    cleanup,
    onDictChange,
  };
}

/**
 * 字典同步组合式函数（单例模式）
 *
 * 用于监听后端字典变更并自动同步到前端缓存
 */
export function useDictSync() {
  if (!singletonInstance) {
    singletonInstance = createDictSyncComposable();
  }
  return singletonInstance;
}
