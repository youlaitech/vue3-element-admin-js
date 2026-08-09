<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item label="操作人" prop="createBy">
          <el-input
            v-model="params.createBy"
            placeholder="操作人"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="操作类型" prop="type">
          <el-select v-model="params.type" placeholder="全部" clearable>
            <el-option :value="LogActionType.INSERT" label="新增" />
            <el-option :value="LogActionType.UPDATE" label="修改" />
            <el-option :value="LogActionType.DELETE" label="删除" />
          </el-select>
        </el-form-item>

        <el-form-item label="操作日期" prop="createTime">
          <el-date-picker
            v-model="params.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card ref="tableWrapperRef" class="page-content" shadow="never">
      <div class="page-toolbar">
        <div class="page-toolbar__right">
          <el-tooltip content="刷新" placement="top">
            <el-button class="page-icon-btn" @click="fetchData">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="全屏" placement="top">
            <el-button class="page-icon-btn" @click="toggleFullscreen">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <div class="page-table-wrapper">
        <el-table
          ref="dataTableRef"
          v-loading="loading"
          class="page-table"
          :data="list"
          height="100%"
          highlight-current-row
          border
        >
          <el-table-column type="index" width="55" label="序号" align="center" />
          <el-table-column label="操作人" width="100" prop="createBy" />
          <el-table-column label="操作 IP" width="150" prop="ip" />

          <el-table-column label="操作模块" prop="module" width="150" />
          <el-table-column label="请求路径" prop="path" min-width="160" show-overflow-tooltip />
          <el-table-column label="请求方式" prop="method" width="90" align="center">
            <template #default="scope">
              <el-tag
                v-if="scope.row.method"
                :type="methodTagType(scope.row.method)"
                effect="dark"
                size="small"
              >
                {{ scope.row.method.toUpperCase() }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作类型" align="center" width="100">
            <template #default="scope">
              <el-tag :type="actionTypeTagType(scope.row.type)" size="small">
                {{ actionTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作耗时" prop="duration" width="110" align="center">
            <template #default="scope">
              {{ scope.row.duration !== undefined ? scope.row.duration + " ms" : "-" }}
            </template>
          </el-table-column>

          <el-table-column label="操作日期" prop="createTime" width="160" />
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="handleViewClick(scope.row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="params.pageNum"
        v-model:limit="params.pageSize"
        class="page-pagination"
        @pagination="fetchData"
      />
    </el-card>

    <!-- 日志详情 -->
    <el-dialog v-model="detailDialogVisible" title="日志详情" width="700px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作人">{{ detailForm.createBy }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ detailForm.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="actionTypeTagType(detailForm.type)" size="small">
            {{ actionTypeLabel(detailForm.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求方式">
          <el-tag
            v-if="detailForm.method"
            :type="methodTagType(detailForm.method)"
            effect="dark"
            size="small"
          >
            {{ detailForm.method.toUpperCase() }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请求路径" :span="2">{{ detailForm.path }}</el-descriptions-item>
        <el-descriptions-item label="操作 IP">{{ detailForm.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作耗时">
          {{ detailForm.duration !== undefined ? detailForm.duration + " ms" : "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="操作时间" :span="2">{{ detailForm.createTime }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <div class="json-pre">{{ formatJson(detailForm.requestParams) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="响应结果" :span="2">
          <div class="json-pre">{{ formatJson(detailForm.responseResult) }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { useFullscreen } from "@vueuse/core";
import { FullScreen, Refresh } from "@element-plus/icons-vue";

import LogAPI from "@/api/system/log";
import { usePageTable } from "@/composables";
import { LogActionType } from "@/enums";

defineOptions({
  name: "Log",
  inheritAttrs: false,
});

const tableWrapperRef = ref(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
  },
  request: LogAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const detailDialogVisible = ref(false);
const detailForm = ref({});

/**
 * HTTP 方法对应 tag 类型
 */
function methodTagType(method) {
  const map = {
    get: "success",
    post: "primary",
    put: "warning",
    patch: "warning",
    delete: "danger",
  };
  return map[method?.toLowerCase()] ?? "info";
}

/**
 * 操作类型标签类型
 */
function actionTypeTagType(type) {
  const map = {
    [LogActionType.INSERT]: "success",
    [LogActionType.UPDATE]: "warning",
    [LogActionType.DELETE]: "danger",
  };
  return map[type] ?? "info";
}

/**
 * 操作类型标签文本
 */
function actionTypeLabel(type) {
  const map = {
    [LogActionType.INSERT]: "新增",
    [LogActionType.UPDATE]: "修改",
    [LogActionType.DELETE]: "删除",
  };
  return map[type] ?? "其他";
}

/**
 * 格式化 JSON 字符串
 */
function formatJson(str) {
  if (!str) return "-";
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

/**
 * 打开日志详情弹窗
 *
 * @param row 当前日志行
 */
function handleViewClick(row) {
  detailForm.value = row;
  detailDialogVisible.value = true;
}

onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss">
.json-pre {
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  line-height: 1.5;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
}
</style>
