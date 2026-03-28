import { ref } from "vue";
import { useDictStoreHook } from "@/store/modules/dict";
import { useSse } from "./useSse";

let singletonInstance = null;

function createDictSyncComposable() {
  const dictStore = useDictStoreHook();
  const sse = useSse();

  const messageCallbacks = ref([]);

  let unsubscribe = null;

  const handleDictChangeMessage = (data) => {
    const { dictCode } = data;

    if (!dictCode) {
      console.warn("[DictSync] 收到无效的字典变更消息：缺少 dictCode");
      return;
    }

    dictStore.removeDictItem(dictCode);

    messageCallbacks.value.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("[DictSync] 回调函数执行失败:", error);
      }
    });
  };

  const initialize = () => {
    sse.connect();
    unsubscribe = sse.on("dict", handleDictChangeMessage);
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    messageCallbacks.value = [];
  };

  const onDictChange = (callback) => {
    messageCallbacks.value.push(callback);

    return () => {
      const index = messageCallbacks.value.indexOf(callback);
      if (index !== -1) {
        messageCallbacks.value.splice(index, 1);
      }
    };
  };

  return {
    isConnected: sse.isConnected,
    connectionState: sse.connectionState,
    initialize,
    cleanup,
    onDictChange,
  };
}

export function useDictSync() {
  if (!singletonInstance) {
    singletonInstance = createDictSyncComposable();
  }
  return singletonInstance;
}
