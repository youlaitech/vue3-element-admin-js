/**
 * 实时消息协议版本。
 */
export const REALTIME_PROTOCOL_VERSION = 1;
/**
 * 可订阅的业务主题。
 */
export const REALTIME_TOPICS = ["notice", "dict", "presence"];
const MAX_MESSAGE_BYTES = 16_384;
const MAX_TIMER_DELAY_MS = 2_147_483_647;
/**
 * 判断输入是否为非空、非数组对象。
 */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * 校验文本长度及首尾空白。
 */
function isText(value, maximumLength = 128) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumLength &&
    value.trim() === value
  );
}
/**
 * 校验非负安全整数。
 */
function isNonNegativeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
/**
 * 校验可用于定时器的正整数毫秒数。
 */
function isTimerDelay(value) {
  return isNonNegativeInteger(value) && value > 0 && value <= MAX_TIMER_DELAY_MS;
}
/**
 * 校验 UTC 时间及日期有效性。
 */
function isUtcTimestamp(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
  if (!match?.[1]) return false;
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return false;
  const normalized = `${match[1]}.${(match[2] ?? "").padEnd(3, "0")}Z`;
  return new Date(milliseconds).toISOString() === normalized;
}
/**
 * 计算 UTF-8 字节数，超过消息上限时提前结束。
 */
function utf8ByteLength(value) {
  let bytes = 0;
  for (const point of value) {
    const code = point.codePointAt(0) ?? 0;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    if (bytes > MAX_MESSAGE_BYTES) break;
  }
  return bytes;
}
/**
 * 解析并校验服务端消息，业务层只接收可信结构。
 */
export function parseRealtimeServerMessage(text) {
  if (utf8ByteLength(text) > MAX_MESSAGE_BYTES) {
    return { kind: "rejected", reason: "message-too-large" };
  }
  let decoded;
  try {
    decoded = JSON.parse(text);
  } catch {
    return { kind: "rejected", reason: "invalid-json" };
  }
  if (!isRecord(decoded)) return { kind: "rejected", reason: "invalid-metadata" };
  if (decoded["version"] !== REALTIME_PROTOCOL_VERSION) {
    return { kind: "rejected", reason: "unsupported-version" };
  }
  const id = decoded["id"];
  const type = decoded["type"];
  const payload = decoded["payload"];
  if (!isText(id) || !isText(type) || !isRecord(payload)) {
    return { kind: "rejected", reason: "invalid-metadata" };
  }
  const metadata = {
    version: REALTIME_PROTOCOL_VERSION,
    id,
  };
  const invalid = {
    kind: "rejected",
    reason: "invalid-payload",
  };
  switch (type) {
    case "connection.ready": {
      const heartbeatTimeoutMs = payload["heartbeatTimeoutMs"];
      if (!isTimerDelay(heartbeatTimeoutMs)) return invalid;
      return {
        kind: "message",
        message: {
          ...metadata,
          type,
          payload: { heartbeatTimeoutMs },
        },
      };
    }
    case "heartbeat.ping":
      return { kind: "message", message: { ...metadata, type, payload: {} } };
    case "notice.changed": {
      const noticeId = payload["noticeId"];
      const action = payload["action"];
      if (!isText(noticeId) || (action !== "published" && action !== "revoked")) return invalid;
      return { kind: "message", message: { ...metadata, type, payload: { noticeId, action } } };
    }
    case "dict.changed": {
      const dictCode = payload["dictCode"];
      if (!isText(dictCode)) return invalid;
      return { kind: "message", message: { ...metadata, type, payload: { dictCode } } };
    }
    case "presence.snapshot": {
      const onlineUsers = payload["onlineUsers"];
      const onlineConnections = payload["onlineConnections"];
      const nodeId = payload["nodeId"];
      const observedAt = payload["observedAt"];
      if (
        !isNonNegativeInteger(onlineUsers) ||
        !isNonNegativeInteger(onlineConnections) ||
        onlineUsers > onlineConnections ||
        !isText(nodeId) ||
        !isUtcTimestamp(observedAt)
      ) {
        return invalid;
      }
      return {
        kind: "message",
        message: {
          ...metadata,
          type,
          payload: {
            onlineUsers,
            onlineConnections,
            nodeId,
            observedAt,
          },
        },
      };
    }
    default:
      return { kind: "ignored", reason: "unknown-message-type" };
  }
}
/**
 * 校验领票接口，避免无效数据进入连接流程。
 */
export function parseRealtimeTicket(value) {
  const invalid = {
    kind: "rejected",
    reason: "invalid-ticket-response",
  };
  if (!isRecord(value)) return invalid;
  const ticket = value["ticket"];
  if (typeof ticket !== "string" || !/^[A-Za-z0-9_-]{43,256}$/.test(ticket)) {
    return invalid;
  }
  return { kind: "success", value: { ticket } };
}
/**
 * 生成对应服务端心跳的应答消息。
 */
export function createHeartbeatPong(pingId) {
  return {
    version: REALTIME_PROTOCOL_VERSION,
    type: "heartbeat.pong",
    payload: { pingId },
  };
}
