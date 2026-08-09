<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="params.keywords"
            placeholder="应用名称/编码"
            clearable
            @keyup.enter="handleQuery"
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
        <div class="page-toolbar__left">
          <el-button type="primary" @click="handleCreateClick">新增</el-button>
          <el-button type="danger" :disabled="!hasSelection" @click="handleDelete()">删除</el-button>
        </div>
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
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="应用名称" prop="name" min-width="120" />
          <el-table-column label="应用编码" prop="code" min-width="120" />

          <el-table-column label="平台" align="center" width="100">
            <template #default="scope">
              <DictLabel v-if="scope.row.platform" code="app_platform" :value="scope.row.platform" />
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === CommonStatus.ENABLED ? 'success' : 'info'">
                {{ scope.row.status === CommonStatus.ENABLED ? "正常" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="排序" prop="sort" width="80" align="center" />

          <el-table-column fixed="right" label="操作" width="180" align="center">
            <template #default="scope">
              <div>
                <el-button type="primary" size="small" link @click="handleEditClick(scope.row.id)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" link @click="handleDelete(scope.row.id)">
                  删除
                </el-button>
              </div>
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

    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="600px"
      @close="closeDialog"
    >
      <el-form ref="appFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入应用名称" />
        </el-form-item>

        <el-form-item label="应用编码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="请输入应用编码（保存后不可修改）"
            :readonly="!!formData.id"
          />
        </el-form-item>

        <el-form-item label="平台" prop="platform">
          <DictSelect v-model="formData.platform" code="app_platform" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            inline-prompt
            active-text="正常"
            inactive-text="禁用"
            :active-value="CommonStatus.ENABLED"
            :inactive-value="CommonStatus.DISABLED"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 100px"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import { FullScreen, Refresh } from "@element-plus/icons-vue";

import AppAPI from "@/api/system/app";
import { usePageTable, useTableSelection } from "@/composables";
import { CommonStatus } from "@/enums";

defineOptions({
  name: "App",
  inheritAttrs: false,
});

const tableWrapperRef = ref(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref();
const appFormRef = ref();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
  },
  request: AppAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection();

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData = {
  status: CommonStatus.ENABLED,
};

const formData = reactive({ ...initialFormData });

const rules = {
  name: [{ required: true, message: "请输入应用名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入应用编码", trigger: "blur" }],
};

/**
 * 打开应用表单弹窗
 */
function openDialog() {
  dialogState.visible = true;
}

/**
 * 关闭应用表单弹窗
 */
function closeDialog() {
  dialogState.visible = false;
  resetForm();
}

/**
 * 重置应用表单
 */
function resetForm() {
  appFormRef.value?.resetFields();
  appFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete formData[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开新增应用弹窗
 */
function handleCreateClick() {
  dialogState.title = "新增应用";
  openDialog();
}

/**
 * 打开编辑应用弹窗并回填数据
 *
 * @param appId 应用 ID
 */
async function handleEditClick(appId) {
  dialogState.title = "修改应用";
  const data = await AppAPI.getFormData(appId);
  Object.assign(formData, data);
  openDialog();
}

/**
 * 校验并提交应用表单
 */
async function handleSubmit() {
  const valid = await appFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const appId = formData.id;
    if (appId) {
      await AppAPI.update(appId, formData);
      ElMessage.success("修改成功");
    } else {
      await AppAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 删除单个或批量应用
 *
 * @param appId 指定时删除单个应用；不指定时删除表格勾选项
 */
async function handleDelete(appId) {
  const appIds = appId ?? selectedIds.value.join(",");
  if (!appIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除已选中的应用?", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    ElMessage.info("已取消删除");
    return;
  }

  loading.value = true;
  try {
    await AppAPI.deleteByIds(appIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  handleQuery();
});
</script>
