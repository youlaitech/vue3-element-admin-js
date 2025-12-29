import { useDictSync } from "./useDictSync";
import { useOnlineCount } from "./useOnlineCount";

/**
 * 初始化所有 WebSocket 服务
 */
export function setupWebSocket() {
  // 初始化字典同步服务
  const dictSync = useDictSync();
  dictSync.initialize();

  // 初始化在线用户统计服务
  const onlineCount = useOnlineCount();
  onlineCount.initialize();
}

/**
 * 清理所有 WebSocket 连接
 */
export function cleanupWebSocket() {
  // 清理字典同步服务
  const dictSync = useDictSync();
  dictSync.cleanup();

  // 清理在线用户统计服务
  const onlineCount = useOnlineCount();
  onlineCount.cleanup();
}

// 导出所有 WebSocket 相关的 composables
export { useDictSync } from "./useDictSync";
export { useOnlineCount } from "./useOnlineCount";
export { useStomp } from "./useStomp";
