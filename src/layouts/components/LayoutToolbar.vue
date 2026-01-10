<template>
  <div :class="['navbar-actions', navbarActionsClass]">
    <!-- 桌面端工具项 -->
    <template v-if="isDesktop">
      <!-- 搜索 -->
      <div class="navbar-actions__item">
        <CommandPalette />
      </div>

      <!-- 全屏 -->
      <div class="navbar-actions__item">
        <Fullscreen />
      </div>

      <!-- 布局大小 -->
      <div class="navbar-actions__item">
        <SizeSelect />
      </div>

      <!-- 语言选择 -->
      <div class="navbar-actions__item">
        <LangSelect />
      </div>

      <!-- 通知 -->
      <div class="navbar-actions__item">
        <NoticeDropdown />
      </div>

      <!-- 租户选择（如启用多租户且租户数大于 1） -->
      <div v-if="showTenantSelect" class="navbar-actions__item">
        <TenantSwitcher @change="handleTenantChange" />
      </div>
    </template>

    <!-- 用户菜单 -->
    <div class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <div style="width: 28px; height: 28px; overflow: hidden; border-radius: 50%">
            <img
              :src="userStore.userInfo.avatar"
              class="user-profile__avatar"
              style="width: 100%; height: 100%; object-fit: cover; object-position: center"
            />
          </div>
          <span class="user-profile__name">{{ userStore.userInfo.username }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfileClick">
              {{ t("navbar.profile") }}
            </el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              {{ t("navbar.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 系统设置 -->
    <div v-if="defaults.showSettings" class="navbar-actions__item" @click="handleSettingsClick">
      <div class="i-svg:setting" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import CommandPalette from "@/components/CommandPalette/index.vue";
import Fullscreen from "@/components/Fullscreen/index.vue";
import SizeSelect from "@/components/SizeSelect/index.vue";
import LangSelect from "@/components/LangSelect/index.vue";
import NoticeDropdown from "@/components/NoticeDropdown/index.vue";
import TenantSwitcher from "@/components/TenantSwitcher/index.vue";
import { useAppStore, useSettingsStore, useUserStore } from "@/store";
import { useTenantStoreHook } from "@/store/modules/tenant";
import { defaults } from "@/settings";
import { DeviceEnum, LayoutMode, SidebarColor, ThemeMode } from "@/enums/settings";

const { t } = useI18n();
const appStore = useAppStore();
const settingStore = useSettingsStore();
const userStore = useUserStore();
const tenantStore = useTenantStoreHook();
const route = useRoute();
const router = useRouter();

const isDesktop = computed(() => appStore.device === DeviceEnum.DESKTOP);

const showTenantSelect = computed(() => {
  if (!tenantStore.tenantList || tenantStore.tenantList.length === 0) {
    return false;
  }
  if (tenantStore.tenantList.length === 1) {
    return false;
  }
  return true;
});

function handleTenantChange(tenantId) {
  tenantStore
    .switchTenant(tenantId)
    .then(() => {
      ElMessage.success("切换租户成功");
      window.location.reload();
    })
    .catch((error) => {
      ElMessage.error(error?.message || "切换租户失败");
    });
}

function handleProfileClick() {
  router.push({ name: "Profile" });
}

function logout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    lockScroll: false,
  }).then(() => {
    userStore.logout().then(() => {
      router.push(`/login?redirect=${route.fullPath}`);
    });
  });
}

function handleSettingsClick() {
  settingStore.settingsVisible = true;
}

const navbarActionsClass = computed(() => {
  if (settingStore.theme === ThemeMode.DARK) {
    return "navbar-actions--white-text";
  }

  if (settingStore.theme === ThemeMode.LIGHT) {
    if (settingStore.layout === LayoutMode.TOP || settingStore.layout === LayoutMode.MIX) {
      if (settingStore.sidebarColorScheme === SidebarColor.CLASSIC_BLUE) {
        return "navbar-actions--white-text";
      } else {
        return "navbar-actions--dark-text";
      }
    }
  }

  return "navbar-actions--dark-text";
});
</script>

<style lang="scss" scoped>
.navbar-actions {
  display: flex;
  align-items: center;
  min-height: 44px;

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    padding: 0 8px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    > * {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :deep(.el-dropdown),
    :deep(.el-tooltip) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 44px;
    }

    :deep([class^="i-svg:"]) {
      font-size: 18px;
      line-height: 1;
      color: var(--el-text-color-regular);
      transition: color 0.3s;
    }

    :deep(.i-svg\:language) {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      font-size: 18px;
      line-height: 18px;
      background-size: 18px 18px;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);

      :deep([class^="i-svg:"]) {
        color: var(--el-color-primary);
      }
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    padding: 0 8px;
    cursor: pointer;
    user-select: none;

    &__avatar {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }

    &__name {
      margin-left: 8px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
      transition: color 0.3s;
    }
  }
}

.navbar-actions--white-text {
  .navbar-actions__item {
    :deep([class^="i-svg:"]) {
      color: rgba(255, 255, 255, 0.85);
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);

      :deep([class^="i-svg:"]) {
        color: #fff;
      }
    }
  }

  .user-profile__name {
    color: rgba(255, 255, 255, 0.85);
  }

  ::v-deep(.tenant-switcher__trigger) {
    color: rgba(255, 255, 255, 0.85);
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: rgba(255, 255, 255, 0.85);
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: #fff;
  }
}

.navbar-actions--dark-text {
  .navbar-actions__item {
    :deep([class^="i-svg:"]) {
      color: var(--el-text-color-regular) !important;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);

      :deep([class^="i-svg:"]) {
        color: var(--el-color-primary) !important;
      }
    }
  }

  .user-profile__name {
    color: var(--el-text-color-regular) !important;
  }

  ::v-deep(.tenant-switcher__trigger) {
    color: var(--el-text-color-regular) !important;
  }
  ::v-deep(.tenant-switcher__trigger .tenant-switcher__icon) {
    color: var(--el-text-color-regular) !important;
  }
  ::v-deep(.tenant-switcher__trigger:hover) {
    color: var(--el-color-primary) !important;
    background: rgba(0, 0, 0, 0.04);
  }
  ::v-deep(.tenant-switcher__trigger:hover .tenant-switcher__icon) {
    color: var(--el-color-primary) !important;
  }
}

::v-deep(.el-dropdown-menu) {
  [class^="i-svg:"] {
    color: var(--el-text-color-regular) !important;

    &:hover {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
