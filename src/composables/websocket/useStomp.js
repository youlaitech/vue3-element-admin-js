import { Client } from "@stomp/stompjs";
import { computed, ref, watch } from "vue";
import { AuthStorage } from "@/utils/auth";

const ConnectionState = {
  DISCONNECTED: "DISCONNECTED",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  RECONNECTING: "RECONNECTING",
};

/**
 * STOMP WebSocket 连接管理组合式函数（JS版）
 *
 * 目标：目录结构与 TS 标准版保持一致，API 尽量兼容现有 JS 调用方式。
 */
export function useStomp(options = {}) {
  const defaultBrokerURL = import.meta.env.VITE_APP_WS_ENDPOINT || "";

  const config = {
    brokerURL: ref(options.brokerURL ?? defaultBrokerURL),
    reconnectDelay: options.reconnectDelay ?? 15000,
    connectionTimeout: options.connectionTimeout ?? 10000,
    maxReconnectAttempts: options.maxReconnectAttempts ?? 3,
    debug: options.debug ?? false,
    autoRestoreSubscriptions: options.autoRestoreSubscriptions ?? true,
    heartbeatIncoming: options.heartbeatIncoming ?? 4000,
    heartbeatOutgoing: options.heartbeatOutgoing ?? 4000,
  };

  const connectionState = ref(ConnectionState.DISCONNECTED);
  const isConnected = computed(() => connectionState.value === ConnectionState.CONNECTED);
  const reconnectAttempts = ref(0);

  let reconnectTimer = null;
  let connectionTimeoutTimer = null;
  let isManualDisconnect = false;

  // stomp 客户端实例（兼容旧版 JS：对外暴露 client）
  const client = ref(null);

  // 订阅管理
  const activeSubscriptions = new Map(); // subscriptionId -> subscription
  const subscriptionRegistry = new Map(); // destination -> callback
  const destinationToSubscriptionId = new Map(); // destination -> subscriptionId

  const log = (...args) => {
    if (config.debug) {
      console.log("[useStomp]", ...args);
    }
  };

  const clearAllTimers = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
      connectionTimeoutTimer = null;
    }
  };

  const restoreSubscriptions = () => {
    if (!config.autoRestoreSubscriptions || subscriptionRegistry.size === 0) return;

    for (const [destination, callback] of subscriptionRegistry.entries()) {
      performSubscribe(destination, callback);
    }
  };

  const initializeClient = () => {
    if (client.value && (client.value.active || client.value.connected)) {
      return;
    }

    if (!config.brokerURL.value) {
      console.warn("[useStomp] 未配置 WebSocket 端点（VITE_APP_WS_ENDPOINT），跳过初始化");
      return;
    }

    const token = options.token ?? AuthStorage.getAccessToken();
    if (!token) {
      console.warn("[useStomp] token 为空，跳过初始化");
      return;
    }

    client.value = new Client({
      brokerURL: config.brokerURL.value,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: config.debug ? (msg) => console.log("[STOMP]", msg) : () => {},
      reconnectDelay: 0,
      heartbeatIncoming: config.heartbeatIncoming,
      heartbeatOutgoing: config.heartbeatOutgoing,
    });

    client.value.onConnect = () => {
      connectionState.value = ConnectionState.CONNECTED;
      reconnectAttempts.value = 0;
      clearAllTimers();
      log("✅ WebSocket 已连接");
      restoreSubscriptions();
    };

    client.value.onDisconnect = () => {
      connectionState.value = ConnectionState.DISCONNECTED;
      activeSubscriptions.clear();
      destinationToSubscriptionId.clear();
      if (!isManualDisconnect && reconnectAttempts.value < config.maxReconnectAttempts) {
        scheduleReconnect();
      }
    };

    client.value.onWebSocketClose = () => {
      connectionState.value = ConnectionState.DISCONNECTED;
      activeSubscriptions.clear();
      destinationToSubscriptionId.clear();
      if (!isManualDisconnect && reconnectAttempts.value < config.maxReconnectAttempts) {
        scheduleReconnect();
      }
    };

    client.value.onStompError = (frame) => {
      console.error("[useStomp] STOMP error:", frame.headers, frame.body);
      connectionState.value = ConnectionState.DISCONNECTED;
    };
  };

  const scheduleReconnect = () => {
    if (isManualDisconnect) return;
    if (reconnectAttempts.value >= config.maxReconnectAttempts) return;

    reconnectAttempts.value += 1;
    connectionState.value = ConnectionState.RECONNECTING;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
      if (!isManualDisconnect && !isConnected.value) {
        connect();
      }
    }, config.reconnectDelay);
  };

  const connect = () => {
    isManualDisconnect = false;

    if (!config.brokerURL.value) {
      console.warn("[useStomp] 未配置 WebSocket 端点（VITE_APP_WS_ENDPOINT）");
      return;
    }

    if (connectionState.value === ConnectionState.CONNECTING) {
      return;
    }

    if (!client.value) {
      initializeClient();
    }

    if (!client.value) {
      return;
    }

    if (client.value.connected) {
      connectionState.value = ConnectionState.CONNECTED;
      return;
    }

    connectionState.value = ConnectionState.CONNECTING;

    if (connectionTimeoutTimer) {
      clearTimeout(connectionTimeoutTimer);
    }

    connectionTimeoutTimer = setTimeout(() => {
      if (connectionState.value === ConnectionState.CONNECTING) {
        connectionState.value = ConnectionState.DISCONNECTED;
        if (!isManualDisconnect && reconnectAttempts.value < config.maxReconnectAttempts) {
          scheduleReconnect();
        }
      }
    }, config.connectionTimeout);

    try {
      client.value.activate();
    } catch (e) {
      console.error("[useStomp] activate failed", e);
      connectionState.value = ConnectionState.DISCONNECTED;
    }
  };

  const performSubscribe = (destination, callback) => {
    if (!client.value || !client.value.connected) {
      return "";
    }

    try {
      const subscription = client.value.subscribe(destination, callback);
      activeSubscriptions.set(subscription.id, subscription);
      destinationToSubscriptionId.set(destination, subscription.id);
      return subscription.id;
    } catch (e) {
      console.error("[useStomp] subscribe failed", destination, e);
      return "";
    }
  };

  const subscribe = (destination, callback) => {
    subscriptionRegistry.set(destination, callback);

    if (client.value?.connected) {
      return performSubscribe(destination, callback);
    }

    return "";
  };

  // 取消订阅：支持传 subscriptionId（旧实现）
  const unsubscribe = (subscriptionId) => {
    const subscription = activeSubscriptions.get(subscriptionId);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (e) {
        console.warn("[useStomp] unsubscribe failed", e);
      }
      activeSubscriptions.delete(subscriptionId);
    }
  };

  // 取消某个 destination 的订阅（与 TS 标准版思路一致）
  const unsubscribeDestination = (destination) => {
    subscriptionRegistry.delete(destination);

    const subscriptionId = destinationToSubscriptionId.get(destination);
    if (subscriptionId) {
      unsubscribe(subscriptionId);
      destinationToSubscriptionId.delete(destination);
    }
  };

  const disconnect = (clearSubscriptions = true) => {
    isManualDisconnect = true;
    clearAllTimers();

    for (const [id, subscription] of activeSubscriptions.entries()) {
      try {
        subscription.unsubscribe();
      } catch {
        // ignore
      }
      activeSubscriptions.delete(id);
    }
    destinationToSubscriptionId.clear();

    if (clearSubscriptions) {
      subscriptionRegistry.clear();
    }

    if (client.value) {
      try {
        if (client.value.connected || client.value.active) {
          client.value.deactivate();
        }
      } catch {
        // ignore
      }
      client.value = null;
    }

    connectionState.value = ConnectionState.DISCONNECTED;
    reconnectAttempts.value = 0;
  };

  const cleanup = () => {
    disconnect(true);
  };

  watch(config.brokerURL, (newURL, oldURL) => {
    if (newURL !== oldURL) {
      if (client.value && client.value.connected) {
        try {
          client.value.deactivate();
        } catch {
          // ignore
        }
      }
      initializeClient();
    }
  });

  initializeClient();

  return {
    // 兼容/增强：既支持旧字段，也支持标准版字段
    client,
    connectionState,
    isConnected,
    reconnectAttempts,
    brokerURL: config.brokerURL,

    connect,
    disconnect,
    cleanup,

    subscribe,
    unsubscribe,
    unsubscribeDestination,

    getActiveSubscriptionCount: () => activeSubscriptions.size,
    getRegisteredSubscriptionCount: () => subscriptionRegistry.size,
  };
}
