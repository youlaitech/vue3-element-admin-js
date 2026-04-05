import { AuthStorage } from "@/utils/auth";

export const SseConnectionState = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
};

let globalInstance = null;

function createSseConnection(options = {}) {
  const baseUrl = import.meta.env.VITE_APP_BASE_API;
  const defaultUrl = `${baseUrl}/api/v1/sse/connect`;

  const config = {
    url: options.url ?? defaultUrl,
    debug: options.debug ?? false,
    connectionTimeout: options.connectionTimeout ?? 10000,
    /** 重连间隔基数，实际间隔 = min(基数 × 2^n, 最大间隔) */
    reconnectInterval: options.reconnectInterval ?? 5000,
    maxReconnectInterval: options.maxReconnectInterval ?? 120000,
    maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
  };

  const connectionState = ref(SseConnectionState.DISCONNECTED);
  const isConnected = computed(() => connectionState.value === SseConnectionState.CONNECTED);

  let abortController = null;
  let connectionTimeoutTimer = null;
  let reader = null;
  let isManualDisconnect = false;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  let currentReconnectInterval = config.reconnectInterval;

  const eventHandlers = new Map();

  const log = (...args) => console.log("[SSE]", ...args);
  const logError = (...args) => console.error("[SSE]", ...args);

  const clearTimer = (timer) => {
    if (timer) {
      clearTimeout(timer);
      return null;
    }
    return timer;
  };

  // 指数退避重连
  const scheduleReconnect = () => {
    if (isManualDisconnect) return;
    if (config.maxReconnectAttempts > 0 && reconnectAttempts >= config.maxReconnectAttempts) {
      log(`已达到最大重试次数 ${config.maxReconnectAttempts}，停止重连`);
      return;
    }

    reconnectAttempts++;
    log(`将在 ${currentReconnectInterval}ms 后重试（${reconnectAttempts}）`);

    reconnectTimer = setTimeout(() => {
      connect();
      currentReconnectInterval = Math.min(
        currentReconnectInterval * 2,
        config.maxReconnectInterval
      );
    }, currentReconnectInterval);
  };

  const connect = () => {
    isManualDisconnect = false;

    if (connectionState.value !== SseConnectionState.DISCONNECTED) {
      log(
        connectionState.value === SseConnectionState.CONNECTED
          ? "SSE 已连接，跳过重复连接"
          : "SSE 正在连接中，跳过重复连接"
      );
      return;
    }

    const token = AuthStorage.getAccessToken();
    if (!token) {
      log("未检测到有效令牌，跳过 SSE 连接");
      return;
    }

    connectionState.value = SseConnectionState.CONNECTING;
    abortController = new AbortController();

    // 超时自动断开
    connectionTimeoutTimer = setTimeout(() => {
      if (connectionState.value === SseConnectionState.CONNECTING) {
        log("SSE 连接超时");
        disconnect();
      }
    }, config.connectionTimeout);

    log("正在建立 SSE 连接...");

    fetch(config.url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        connectionTimeoutTimer = clearTimer(connectionTimeoutTimer);
        connectionState.value = SseConnectionState.CONNECTED;
        reconnectAttempts = 0;
        currentReconnectInterval = config.reconnectInterval;
        log("SSE 连接已建立");
        return response.body?.getReader();
      })
      .then((r) => {
        if (!r) return;
        reader = r;
        const decoder = new TextDecoder();
        let buffer = "";
        let currentEvent = "message";
        let currentData = "";

        // SSE 文本协议解析：event / data / 空行分隔
        const processChunk = ({ done, value }) => {
          if (done) {
            connectionState.value = SseConnectionState.DISCONNECTED;
            log("SSE 连接已关闭");
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith(":")) continue;
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const dataLine = line.slice(5).trim();
              currentData = currentData ? `${currentData}\n${dataLine}` : dataLine;
            } else if (line === "") {
              if (currentData) {
                const handlers = eventHandlers.get(currentEvent);
                if (handlers) {
                  try {
                    const data = JSON.parse(currentData);
                    handlers.forEach((h) => h(data));
                  } catch {
                    handlers.forEach((h) => h(currentData));
                  }
                }
                log(`收到事件[${currentEvent}]:`, currentData);
              }
              currentEvent = "message";
              currentData = "";
            }
          }

          return reader.read().then(processChunk);
        };

        return reader.read().then(processChunk);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          log("SSE 连接已主动断开");
        } else {
          logError("SSE 连接错误:", err);
          connectionState.value = SseConnectionState.DISCONNECTED;
          scheduleReconnect();
        }
      });
  };

  // 订阅事件，返回取消函数
  const on = (eventName, handler) => {
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, new Set());
    }
    eventHandlers.get(eventName).add(handler);
    log(`已订阅事件: ${eventName}`);

    return () => {
      const handlers = eventHandlers.get(eventName);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlers.delete(eventName);
        }
      }
    };
  };

  // 主动断开，不会触发重连
  const disconnect = () => {
    isManualDisconnect = true;
    connectionTimeoutTimer = clearTimer(connectionTimeoutTimer);
    reconnectTimer = clearTimer(reconnectTimer);
    reader?.cancel();
    reader = null;
    abortController?.abort();
    abortController = null;
    connectionState.value = SseConnectionState.DISCONNECTED;
    log("SSE 连接已断开");
  };

  // 登出时调用，断开并释放所有资源
  const cleanup = () => {
    disconnect();
    eventHandlers.clear();
    log("SSE 资源已清理");
  };

  return {
    connectionState: readonly(connectionState),
    isConnected,
    connect,
    disconnect,
    cleanup,
    on,
  };
}

export function useSse(options = {}) {
  if (!globalInstance) {
    globalInstance = createSseConnection(options);
  }
  return globalInstance;
}

export function cleanupSse() {
  if (globalInstance) {
    globalInstance.cleanup();
    globalInstance = null;
  }
}
