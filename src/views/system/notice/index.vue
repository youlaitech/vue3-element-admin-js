<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true" label-width="auto">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="params.keywords"
            placeholder="标题/发布人"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="发布时间" prop="publishTime">
          <el-date-picker
            v-model="params.publishTime"
            type="daterange"
            :editable="false"
            range-separator="~"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 240px"
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
          <el-table-column label="通知标题" prop="title" min-width="180" show-overflow-tooltip />
          <el-table-column label="通知类型" prop="noticeTypeLabel" width="120" />
          <el-table-column label="发布状态" align="center" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.publishStatus === 1 ? 'success' : 'info'">
                {{ scope.row.publishStatus === 1 ? "已发布" : "未发布" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发布人" prop="publisherName" width="120" />
          <el-table-column label="发布时间" prop="publishTime" width="160" />
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="scope">
              <div>
                <el-button type="primary" size="small" link @click="handleViewClick(scope.row)">
                  查看
                </el-button>
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
      width="660px"
      append-to-body
      @close="closeDialog"
    >
      <el-form ref="noticeFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入通知标题" />
        </el-form-item>

        <el-form-item label="通知类型" prop="noticeType">
          <DictSelect v-model="formData.noticeType" code="notice_type" @change="handleNoticeTypeChange" />
        </el-form-item>

        <el-form-item label="通知等级" prop="level">
          <DictSelect v-model="formData.level" code="notice_level" />
        </el-form-item>

        <el-form-item label="目标类型" prop="targetType">
          <el-select v-model="formData.targetType" placeholder="请选择目标类型" style="width: 100%">
            <el-option :value="NoticeTargetType.EVERYONE" label="所有人" />
            <el-option :value="NoticeTargetType.SPECIFIED" label="指定用户" />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="formData.targetType === NoticeTargetType.SPECIFIED"
          label="目标用户"
          prop="targetUserIds"
        >
          <el-select
            v-model="formData.targetUserIds"
            multiple
            filterable
            placeholder="请选择目标用户"
            style="width: 100%"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="请输入通知内容"
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

    <!-- 通知详情 -->
    <el-dialog v-model="detailDialogVisible" title="通知详情" width="660px" append-to-body>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="通知标题">{{ detailForm.title }}</el-descriptions-item>
        <el-descriptions-item label="通知类型">{{ detailForm.noticeTypeLabel }}</el-descriptions-item>
        <el-descriptions-item label="通知等级">{{ detailForm.levelLabel }}</el-descriptions-item>
        <el-descriptions-item label="目标用户">{{ detailForm.targetUserNames }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="detailForm.publishStatus === 1 ? 'success' : 'info'">
            {{ detailForm.publishStatus === 1 ? "已发布" : "未发布" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布人">{{ detailForm.publisherName }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detailForm.publishTime }}</el-descriptions-item>
        <el-descriptions-item label="通知内容">
          <div class="preserve-whitespace">{{ detailForm.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import { FullScreen, Refresh } from "@element-plus/icons-vue";

import NoticeAPI from "@/api/system/notice";
import UserAPI from "@/api/system/user";
import { usePageTable, useTableSelection } from "@/composables";
import { NoticeTargetType } from "@/enums";

defineOptions({
  name: "Notice",
  inheritAttrs: false,
});

const tableWrapperRef = ref(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref();
const noticeFormRef = ref();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
  },
  request: NoticeAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const { selectedIds, hasSelection, handleSelectionChange } = useTableSelection();

const dialogState = reactive({
  visible: false,
  title: "",
});

const detailDialogVisible = ref(false);
const detailForm = ref({});
const userOptions = ref([]);

const initialFormData = {
  targetType: NoticeTargetType.EVERYONE,
};

const formData = reactive({ ...initialFormData });

const rules = {
  title: [{ required: true, message: "请输入通知标题", trigger: "blur" }],
  noticeType: [{ required: true, message: "请选择通知类型", trigger: "change" }],
  content: [{ required: true, message: "请输入通知内容", trigger: "blur" }],
  targetType: [{ required: true, message: "请选择目标类型", trigger: "change" }],
  targetUserIds: [{ required: true, message: "请选择目标用户", trigger: "change" }],
};

/**
 * 通知类型变更时同步清空目标用户
 *
 * 避免不同类型间的残留数据
 */
function handleNoticeTypeChange() {
  formData.targetUserIds = [];
}

/**
 * 打开通知表单弹窗
 */
function openDialog() {
  dialogState.visible = true;
}

/**
 * 关闭通知表单弹窗并重置表单
 */
function closeDialog() {
  dialogState.visible = false;
  resetForm();
}

/**
 * 重置通知表单
 */
function resetForm() {
  noticeFormRef.value?.resetFields();
  noticeFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete formData[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开新增通知弹窗
 */
async function handleCreateClick() {
  dialogState.title = "新增通知";
  userOptions.value = await UserAPI.getOptions();
  openDialog();
}

/**
 * 打开编辑通知弹窗并回填数据
 *
 * @param id 通知 ID
 */
async function handleEditClick(id) {
  dialogState.title = "修改通知";
  userOptions.value = await UserAPI.getOptions();
  const data = await NoticeAPI.getFormData(id);
  // 后端可能返回字符串或数字，前端统一处理
  const targetUserIds = data.targetUserIds
    ? (Array.isArray(data.targetUserIds)
        ? data.targetUserIds
        : data.targetUserIds.split(",")
      ).map(Number)
    : [];
  Object.assign(formData, { ...data, targetUserIds });
  openDialog();
}

/**
 * 校验并提交通知表单
 *
 * 提交前对 targetUserIds 做归一化处理（数组 → 逗号分隔字符串）
 */
async function handleSubmit() {
  const valid = await noticeFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    const submitData = { ...formData };
    // 所有人时不传 targetUserIds
    if (submitData.targetType === NoticeTargetType.EVERYONE) {
      submitData.targetUserIds = undefined;
    } else {
      // 指定用户时把数组转成逗号分隔字符串（若仍是数组）
      submitData.targetUserIds = Array.isArray(submitData.targetUserIds)
        ? submitData.targetUserIds.join(",")
        : submitData.targetUserIds;
    }

    if (formData.id) {
      await NoticeAPI.update(formData.id, submitData);
      ElMessage.success("修改成功");
    } else {
      await NoticeAPI.create(submitData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 删除单个或批量通知
 *
 * @param noticeId 指定时删除单个通知；不指定时删除表格勾选项
 */
async function handleDelete(noticeId) {
  const noticeIds = noticeId ?? selectedIds.value.join(",");
  if (!noticeIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
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
    await NoticeAPI.deleteByIds(noticeIds);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 打开通知详情弹窗
 *
 * @param row 当前通知行
 */
function handleViewClick(row) {
  detailForm.value = row;
  detailDialogVisible.value = true;
}

onMounted(() => {
  handleQuery();
});
</script>
