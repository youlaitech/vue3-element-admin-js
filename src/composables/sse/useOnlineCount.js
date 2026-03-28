import { onMounted, ref } from "vue";
import { useSse } from "./useSse";

let globalInstance = null;

function createOnlineCountComposable() {
  const onlineUserCount = ref(0);
  const lastUpdateTime = ref(0);

  const sse = useSse();

  let unsubscribe = null;

  const handleOnlineCountMessage = (count) => {
    if (count !== undefined && !isNaN(count)) {
      onlineUserCount.value = count;
      lastUpdateTime.value = Date.now();
    }
  };

  const initialize = () => {
    sse.connect();
    unsubscribe = sse.on("online-count", handleOnlineCountMessage);
  };

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    onlineUserCount.value = 0;
    lastUpdateTime.value = 0;
  };

  return {
    onlineUserCount,
    lastUpdateTime,
    isConnected: sse.isConnected,
    connectionState: sse.connectionState,
    initialize,
    cleanup,
  };
}

export function useOnlineCount(options = {}) {
  const { autoInit = true } = options;

  if (!globalInstance) {
    globalInstance = createOnlineCountComposable();
  }

  if (autoInit) {
    onMounted(() => {
      if (!globalInstance.isConnected.value) {
        globalInstance.initialize();
      }
    });
  }

  return globalInstance;
}
