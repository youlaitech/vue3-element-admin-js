<template>
  <div class="layout-settings">
    <!-- 设置按钮 -->
    <el-button type="text" icon="Setting" @click="settingsDialogVisible = true" />

    <!-- 设置对话框 -->
    <el-dialog
      v-model="settingsDialogVisible"
      title="系统设置"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="settings-content">
        <el-tabs v-model="activeTab">
          <!-- 主题设置 -->
          <el-tab-pane label="主题设置" name="theme">
            <div class="setting-item">
              <div class="setting-label">主题模式</div>
              <el-radio-group v-model="settingsStore.theme">
                <el-radio label="light">明亮</el-radio>
                <el-radio label="dark">暗黑</el-radio>
              </el-radio-group>
            </div>

            <div class="setting-item">
              <div class="setting-label">主题颜色</div>
              <el-color-picker v-model="settingsStore.themeColor" />
            </div>
          </el-tab-pane>

          <!-- 界面设置 -->
          <el-tab-pane label="界面设置" name="interface">
            <div class="setting-item">
              <el-checkbox v-model="settingsStore.showTagsView">显示标签页</el-checkbox>
            </div>

            <div class="setting-item">
              <el-checkbox v-model="settingsStore.showAppLogo">显示应用Logo</el-checkbox>
            </div>
          </el-tab-pane>

          <!-- 布局设置 -->
          <el-tab-pane label="布局设置" name="layout">
            <div class="setting-item">
              <div class="setting-label">布局模式</div>
              <el-radio-group v-model="settingsStore.layout">
                <el-radio label="left">左侧菜单</el-radio>
                <el-radio label="top">顶部菜单</el-radio>
                <el-radio label="mix">混合菜单</el-radio>
              </el-radio-group>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <el-button @click="settingsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useSettingsStore } from "@/store";

const settingsStore = useSettingsStore();

const settingsDialogVisible = ref(false);
const activeTab = ref("theme");

function handleSave() {
  ElMessage.success("设置已保存");
  settingsDialogVisible.value = false;
}
</script>

<style lang="scss" scoped>
.layout-settings {
  .settings-content {
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-light);

      .setting-label {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
