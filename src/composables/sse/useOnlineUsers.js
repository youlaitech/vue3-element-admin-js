import { ref, readonly } from "vue";
import { useSse } from "./useSse";
import { SseTopics } from "./sseTopics";

let globalInstance = null;

function createOnlineUsersComposable() {
  const onlineUserCount = ref(0);
  const lastUpdateTime = ref(0);

  const sse = useSse();

  let unsubscribe = null;

  const handleOnlineUsersMessage = (count) => {
    if (!Number.isFinite(count) || count < 0) return;
    onlineUserCount.value = count;
    lastUpdateTime.value = Date.now();
  };

  const initialize = () => {
    unsubscribe = sse.on(SseTopics.ONLINE_USERS, handleOnlineUsersMessage);
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
    onlineUserCount: readonly(onlineUserCount),
    lastUpdateTime: readonly(lastUpdateTime),
    isConnected: sse.isConnected,
    connectionState: sse.connectionState,
    initialize,
    cleanup,
  };
}

/** 鍦ㄧ嚎鐢ㄦ埛鏁扮粍鍚堝紡鍑芥暟锛堝崟渚嬫ā寮忥級 */
export function useOnlineUsers() {
  if (!globalInstance) {
    globalInstance = createOnlineUsersComposable();
  }
  return globalInstance;
}
