<template>
  <div class="qr-login">
    <h2 class="qr-login__title">鎵爜鐧诲綍</h2>
    <p class="qr-login__desc">浣跨敤 youlai-app 鎵弿涓嬫柟浜岀淮鐮佺櫥褰?/p>

    <div class="qr-login__board">
      <div v-if="state === 'loading'" class="qr-login__mask">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>浜岀淮鐮佺敓鎴愪腑...</span>
      </div>

      <div v-else-if="state === 'scanned'" class="qr-login__mask qr-login__mask--info">
        <el-avatar :size="56" :src="avatar || undefined">
          <el-icon><User /></el-icon>
        </el-avatar>
        <span class="qr-login__mask-text">{{ nickname }} 宸叉壂鐮?/span>
        <span class="qr-login__mask-hint">璇峰湪鎵嬫満涓婄‘璁ょ櫥褰?/span>
      </div>

      <div v-else-if="state === 'expired'" class="qr-login__mask">
        <el-icon :size="28"><CircleClose /></el-icon>
        <span>浜岀淮鐮佸凡杩囨湡</span>
        <el-button type="primary" link @click="start">鐐瑰嚮鍒锋柊</el-button>
      </div>

      <div v-else-if="state === 'canceled'" class="qr-login__mask">
        <el-icon :size="28"><CircleClose /></el-icon>
        <span>宸插彇娑堢櫥褰?/span>
        <el-button type="primary" link @click="start">閲嶆柊鐢熸垚</el-button>
      </div>

      <canvas v-show="state === 'waiting'" ref="canvasRef" class="qr-login__canvas" />
    </div>

    <div class="qr-login__footer">
      <el-button text @click="emit('switch', 'login')">
        <el-icon><ArrowLeft /></el-icon>
        杩斿洖璐﹀彿鐧诲綍
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft, CircleClose, Loading, User } from "@element-plus/icons-vue";
import QRCode from "qrcode";
import AuthAPI from "@/api/auth";
import { useUserStore } from "@/stores";
import router from "@/router";
import { useRoute } from "vue-router";
import { onBeforeUnmount, onMounted, ref } from "vue";

// 鐣岄潰鐘舵€佹満锛歭oading(鐢熸垚涓? 鈫?waiting(寰呮壂鐮? 鈫?scanned(宸叉壂鐮佸緟纭)
// 鈫?done(宸茬櫥褰? / expired(杩囨湡鎴栧凡浣跨敤) / canceled(APP 鍙栨秷)

const emit = defineEmits(["switch"]);

const userStore = useUserStore();
const route = useRoute();

// 浜岀淮鐮佺敾甯冨厓绱犲紩鐢紝renderQrCode 鎶?ticket 缁樿繘瀹?
const canvasRef = ref();
// 褰撳墠鐣岄潰鐘舵€侊紝椹卞姩妯℃澘涓伄缃╁眰鐨勬樉闅?
const state = ref("loading");
// 鎵爜鐢ㄦ埛鑴辨晱鏄电О涓庡ご鍍忥紝scanned 鐘舵€佸睍绀?
const nickname = ref("");
const avatar = ref("");

// 褰撳墠绁ㄦ嵁锛岃疆璇笌鐧诲綍鎹护鐗岄兘渚濊禆瀹?
let ticket = "";
// 杞瀹氭椂鍣ㄥ彞鏌勶紝缁勪欢鍗歌浇鎴栧仠姝㈣疆璇㈡椂娓呯┖
let pollTimer = null;

// 杞闂撮殧锛堟绉掞級
const QR_POLL_INTERVAL = 2000;

// 鐢宠绁ㄦ嵁骞舵覆鏌撲簩缁寸爜锛屽紑濮嬭疆璇?
async function start() {
  stopPolling();
  state.value = "loading";
  nickname.value = "";
  avatar.value = "";
  try {
    const res = await AuthAPI.qrGenerate();
    ticket = res.ticket;
    await renderQrCode(ticket);
    state.value = "waiting";
    startPolling();
  } catch {
    state.value = "expired";
  }
}

async function renderQrCode(payload) {
  if (!canvasRef.value) return;
  await QRCode.toCanvas(canvasRef.value, payload, { width: 220, margin: 1 });
}

function startPolling() {
  stopPolling();
  pollTimer = setTimeout(pollOnce, QR_POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

async function pollOnce() {
  if (!ticket) return;
  try {
    const res = await AuthAPI.qrStatus(ticket);
    handleStatus(res);
  } catch {
    startPolling();
  }
}

// 鏍规嵁鍚庣杩斿洖鐘舵€佹帹杩涚晫闈笌涓嬩竴姝ュ姩浣?
function handleStatus(res) {
  switch (res.status) {
    case "WAITING":
      state.value = "waiting";
      startPolling();
      break;
    case "SCANNED":
      state.value = "scanned";
      nickname.value = res.nickname || "";
      avatar.value = res.avatar || "";
      startPolling();
      break;
    case "CONFIRMED":
      doLogin();
      break;
    case "CANCELED":
      state.value = "canceled";
      break;
    case "LOGGED_IN":
    case "EXPIRED":
    default:
      state.value = "expired";
      break;
  }
}

async function doLogin() {
  state.value = "done";
  stopPolling();
  try {
    await userStore.loginByQrCode(ticket);
    const redirectPath = route.query.redirect || "/";
    await router.push(decodeURIComponent(redirectPath));
  } catch {
    state.value = "expired";
  }
}

onMounted(start);
onBeforeUnmount(stopPolling);
</script>

<style lang="scss" scoped>
.qr-login {
  width: 100%;

  &__title {
    margin: 0 0 4px;
    font-size: 34px;
    font-weight: 750;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 8px 0 24px;
    font-size: 14px;
    color: var(--el-text-color-placeholder);
  }

  &__board {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 240px;
    height: 240px;
    margin: 0 auto;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
  }

  &__canvas {
    display: block;
    border-radius: 8px;
  }

  &__mask {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    background: rgb(255 255 255 / 90%);
    backdrop-filter: blur(2px);

    &--info {
      gap: 4px;
    }
  }

  &__mask-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__mask-hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  &__footer {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
