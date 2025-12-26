<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>字典WebSocket实时更新演示</span>
          <el-tag :type="wsConnected ? 'success' : 'danger'" size="small" class="ml-2">
            WebSocket {{ wsStatusText }}
          </el-tag>
        </div>
      </template>

      <el-alert type="info" :closable="false" class="mb-4">
        本示例展示WebSocket实时更新字典缓存的效果。您可以编辑"男"性别字典项，保存后后端将通过WebSocket通知所有客户端刷新缓存。
      </el-alert>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <div class="flex justify-between items-center">
                <span>性别字典值 - 男</span>
                <el-button type="warning" size="small" @click="loadMaleDict">重新加载</el-button>
              </div>
            </template>
            <div>
              <div v-if="dictForm" class="dict-form">
                <el-form :model="dictForm" label-width="80px">
                  <el-form-item label="字典编码">
                    <el-input v-model="dictForm.dictCode" disabled />
                  </el-form-item>
                  <el-form-item label="字典标签">
                    <el-input v-model="dictForm.label" />
                  </el-form-item>
                  <el-form-item label="字典值">
                    <el-input v-model="dictForm.value" disabled />
                  </el-form-item>
                  <el-form-item label="标记颜色">
                    <el-select
                      v-model="dictForm.tagType"
                      placeholder="选择标签类型"
                      style="width: 100%"
                    >
                      <el-option value="success" label="success">
                        <el-tag type="success">success</el-tag>
                      </el-option>
                      <el-option value="warning" label="warning">
                        <el-tag type="warning">warning</el-tag>
                      </el-option>
                      <el-option value="danger" label="danger">
                        <el-tag type="danger">danger</el-tag>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="updateDictItem">更新</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <span>性别字典显示效果</span>
            </template>
            <div>
              <DictTag v-model="genderValue" code="gender" />
              <div class="mt-4">
                <el-select v-model="genderValue" placeholder="选择性别">
                  <el-option
                    v-for="item in genderOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card shadow="hover" class="dict-card">
            <template #header>
              <span>实时日志</span>
            </template>
            <div class="log-container">
              <div v-for="(log, index) in logs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { setupWebSocket, cleanupWebSocket } from "@/composables/websocket";
import { useDictStoreHook } from "@/store/modules/dict";
import DictTag from "@/components/DictTag/index.vue";

const dictForm = ref(null);
const genderValue = ref(1);
const genderOptions = ref([
  { label: "男", value: 1 },
  { label: "女", value: 2 },
]);
const logs = ref([]);

// WebSocket状态
const wsConnected = ref(false);
const wsStatusText = ref("未连接");

// 加载男性别字典数据
const loadMaleDict = async () => {
  try {
    // 这里应该调用API获取字典数据
    console.log("重新加载男性别字典");
  } catch (error) {
    console.error("加载字典失败:", error);
  }
};

// 更新字典项
const updateDictItem = async () => {
  try {
    // 这里应该调用API更新字典
    console.log("更新字典项:", dictForm.value);
  } catch (error) {
    console.error("更新字典失败:", error);
  }
};

// 添加日志
const addLog = (message) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
  });
  if (logs.value.length > 10) {
    logs.value = logs.value.slice(0, 10);
  }
};

onMounted(() => {
  // 模拟加载字典数据
  dictForm.value = {
    dictCode: "gender_male",
    label: "男",
    value: "1",
    tagType: "success",
  };

  // 启动WebSocket
  setupWebSocket();
  wsConnected.value = true;
  wsStatusText.value = "已连接";
  addLog("WebSocket连接成功");
});

onUnmounted(() => {
  cleanupWebSocket();
  wsConnected.value = false;
  wsStatusText.value = "已断开";
  addLog("WebSocket连接已断开");
});
</script>

<style scoped>
.dict-card {
  height: 100%;
}

.dict-form {
  max-width: 300px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.log-time {
  margin-right: 8px;
  color: #999;
}

.log-message {
  color: #666;
}
</style>
