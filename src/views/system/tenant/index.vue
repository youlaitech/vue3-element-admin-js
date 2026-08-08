<template>
  <div class="page-container">
    <el-card class="page-search" shadow="never">
      <el-form ref="queryFormRef" :model="params" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="params.keywords"
            placeholder="租户名称/编码"
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
          <el-button
            v-hasPerm="['sys:tenant:create']"
            type="primary"
            @click="handleCreateClick()"
          >
            新增
          </el-button>
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
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="租户名称" prop="name" min-width="140" />
          <el-table-column label="租户编码" prop="code" width="160" />
          <el-table-column label="套餐" prop="planName" min-width="140" show-overflow-tooltip />
          <el-table-column label="到期时间" prop="expireTime" width="180" />
          <el-table-column label="状态" align="center" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === CommonStatus.ENABLED" type="success">正常</el-tag>
              <el-tag v-else type="info">停用</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="sort" width="80" align="center" />
          <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
          <el-table-column label="创建时间" prop="createTime" width="180" />
          <el-table-column fixed="right" label="操作" width="320">
            <template #default="scope">
              <div>
                <el-button
                  v-hasPerm="['sys:tenant:assign']"
                  type="primary"
                  size="small"
                  link
                  :disabled="isPlatformTenantId(scope.row.id)"
                  @click="handleAssignMenuClick(scope.row)"
                >
                  菜单配置
                </el-button>
                <el-button
                  v-hasPerm="['sys:tenant:assign']"
                  type="primary"
                  size="small"
                  link
                  :disabled="isPlatformTenantId(scope.row.id)"
                  @click="handleChangePlanClick(scope.row)"
                >
                  更换套餐
                </el-button>
                <el-button
                  v-hasPerm="['sys:tenant:update']"
                  type="primary"
                  size="small"
                  link
                  @click="handleEditClick(scope.row.id)"
                >
                  编辑
                </el-button>
                <el-button
                  v-hasPerm="['sys:tenant:delete']"
                  type="danger"
                  size="small"
                  link
                  :disabled="isPlatformTenantId(scope.row.id)"
                  @click="handleDelete(scope.row.id)"
                >
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
        @pagination="fetchData"
      />
    </el-card>

    <!-- 新增/编辑 -->
    <el-dialog
      v-model="dialogState.visible"
      :title="dialogState.title"
      width="520px"
      @close="closeDialog"
    >
      <el-form ref="tenantFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="租户名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户编码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="请输入租户编码（保存后不可修改）"
            :readonly="!!formData.id"
          />
        </el-form-item>
        <el-form-item label="套餐" prop="planId">
          <el-select v-model="formData.planId" placeholder="请选择套餐" style="width: 100%">
            <el-option
              v-for="item in planOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间" prop="expireTime">
          <el-date-picker
            v-model="formData.expireTime"
            type="date"
            placeholder="请选择到期时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            controls-position="right"
            :min="0"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确定</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 更换套餐 -->
    <el-dialog
      v-model="changePlanDialogVisible"
      title="更换套餐"
      width="400px"
      append-to-body
      @close="closeChangePlanDialog"
    >
      <div class="mb-16px">
        租户：{{ changePlanTenant.name || changePlanTenant.code || "-" }}
      </div>
      <el-form ref="changePlanFormRef" :model="changePlanForm" :rules="changePlanRules" label-width="80px">
        <el-form-item label="新套餐" prop="planId">
          <el-select v-model="changePlanForm.planId" placeholder="请选择新套餐" style="width: 100%">
            <el-option
              v-for="item in planOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            :loading="changePlanSubmitting"
            @click="handleChangePlanSubmit"
          >
            确定
          </el-button>
          <el-button @click="closeChangePlanDialog">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 菜单配置 -->
    <el-drawer
      v-model="menuDialogVisible"
      :title="'【' + checkedTenant.name + '】菜单配置'"
      size="600px"
      @close="closeMenuDialog"
    >
      <div class="flex-x-between">
        <el-input v-model="menuKeywords" clearable class="w-[150px]" placeholder="菜单名称">
          <template #prefix>
            <Search />
          </template>
        </el-input>

        <div class="flex-center ml-5">
          <el-button type="primary" size="small" plain @click="toggleMenuTree">
            <template #icon>
              <Switch />
            </template>
            {{ menuExpanded ? "收缩" : "展开" }}
          </el-button>
          <el-checkbox v-model="menuParentChildLinked" class="ml-5" @change="handleMenuLinkChange">
            父子联动
          </el-checkbox>

          <el-tooltip placement="bottom">
            <template #content>
              如果只需勾选菜单权限，不需要勾选子菜单或者按钮权限，请关闭父子联动
            </template>
            <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-tree
        ref="menuTreeRef"
        node-key="value"
        show-checkbox
        :data="menuPermOptions"
        :filter-node-method="handleMenuFilter"
        :default-expand-all="true"
        :check-strictly="!menuParentChildLinked"
        class="mt-5"
      >
        <template #default="{ data }">
          {{ data.label }}
        </template>
      </el-tree>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-hasPerm="['sys:tenant:assign']"
            type="primary"
            @click="handleMenuSubmit"
          >
            确定
          </el-button>
          <el-button @click="menuDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { useFullscreen } from "@vueuse/core";
import { ElMessage, ElMessageBox } from "element-plus";
import { FullScreen, QuestionFilled, Refresh, Search, Switch } from "@element-plus/icons-vue";

import TenantAPI from "@/api/system/tenant";
import TenantPlanAPI from "@/api/system/tenant-plan";
import MenuAPI from "@/api/system/menu";
import { isPlatformTenantId } from "@/utils/tenant";
import { usePageTable } from "@/composables";
import { CommonStatus, DialogMode } from "@/enums";
import { MenuScopeEnum } from "@/enums/business";

defineOptions({
  name: "Tenant",
  inheritAttrs: false,
});

const tableWrapperRef = ref(null);
const { toggle: toggleFullscreen } = useFullscreen(tableWrapperRef);

const queryFormRef = ref();
const tenantFormRef = ref();
const changePlanFormRef = ref();
const menuTreeRef = ref();

/** 分页表格数据管理 */
const { loading, list, total, params, fetchData, handleQuery, handleResetQuery } = usePageTable({
  initialParams: {
    pageNum: 1,
    pageSize: 10,
    keywords: "",
  },
  request: TenantAPI.getPage,
  onBeforeReset: () => queryFormRef.value?.resetFields(),
});

const dialogState = reactive({
  title: "",
  visible: false,
});

const initialFormData = {
  status: CommonStatus.ENABLED,
  sort: 1,
};

const formData = reactive({ ...initialFormData });

const planOptions = ref([]);

const rules = {
  name: [{ required: true, message: "请输入租户名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入租户编码", trigger: "blur" }],
  planId: [{ required: true, message: "请选择套餐", trigger: "change" }],
  expireTime: [{ required: true, message: "请选择到期时间", trigger: "change" }],
};

// 更换套餐
const changePlanDialogVisible = ref(false);
const changePlanSubmitting = ref(false);
const changePlanTenant = reactive({
  id: "",
  name: "",
  code: "",
});
const changePlanForm = reactive({
  planId: "",
});
const changePlanRules = {
  planId: [{ required: true, message: "请选择新套餐", trigger: "change" }],
};

// 菜单配置
const menuDialogVisible = ref(false);
const checkedTenant = ref({});
const menuPermOptions = ref([]);
const menuKeywords = ref("");
const menuExpanded = ref(true);
const menuParentChildLinked = ref(true);

/**
 * 打开租户表单弹窗
 */
function openDialog() {
  dialogState.visible = true;
}

/**
 * 关闭租户表单弹窗并清理临时状态
 */
function closeDialog() {
  dialogState.visible = false;
  resetForm();
}

/**
 * 重置租户表单
 */
function resetForm() {
  tenantFormRef.value?.resetFields();
  tenantFormRef.value?.clearValidate();
  Object.keys(formData).forEach((key) => {
    delete formData[key];
  });
  Object.assign(formData, initialFormData);
}

/**
 * 打开新增租户弹窗
 */
async function handleCreateClick() {
  dialogState.title = "新增租户";
  planOptions.value = await TenantPlanAPI.getOptions();
  openDialog();
}

/**
 * 打开编辑租户弹窗并回填数据
 *
 * @param tenantId 租户 ID
 */
async function handleEditClick(tenantId) {
  if (!tenantId) return;
  dialogState.title = "修改租户";
  const [data, options] = await Promise.all([
    TenantAPI.getFormData(tenantId),
    TenantPlanAPI.getOptions(),
  ]);
  planOptions.value = options;
  Object.assign(formData, data);
  openDialog();
}

/**
 * 校验并提交租户表单
 */
const handleSubmit = useDebounceFn(async () => {
  const valid = await tenantFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  loading.value = true;
  try {
    if (formData.id) {
      await TenantAPI.update(formData.id, formData);
      ElMessage.success("修改成功");
    } else {
      await TenantAPI.create(formData);
      ElMessage.success("新增成功");
    }
    closeDialog();
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}, 300);

/**
 * 删除租户
 *
 * 平台租户不允许删除
 *
 * @param tenantId 租户 ID
 */
async function handleDelete(tenantId) {
  if (!tenantId) return;

  if (isPlatformTenantId(tenantId)) {
    ElMessage.warning("平台租户不允许删除");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除该租户吗？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  loading.value = true;
  try {
    await TenantAPI.deleteByIds(tenantId);
    ElMessage.success("删除成功");
    handleResetQuery();
  } finally {
    loading.value = false;
  }
}

/**
 * 打开更换套餐弹窗
 *
 * @param row 当前租户行
 */
function handleChangePlanClick(row) {
  changePlanTenant.id = row.id;
  changePlanTenant.name = row.name;
  changePlanTenant.code = row.code;
  changePlanForm.planId = row.planId || "";

  // 套餐下拉选项缓存复用
  if (planOptions.value.length === 0) {
    TenantPlanAPI.getOptions().then((options) => {
      planOptions.value = options;
    });
  }

  changePlanDialogVisible.value = true;
}

/**
 * 关闭更换套餐弹窗
 */
function closeChangePlanDialog() {
  changePlanDialogVisible.value = false;
  changePlanFormRef.value?.resetFields();
  changePlanForm.planId = "";
}

/**
 * 提交更换套餐
 */
const handleChangePlanSubmit = useDebounceFn(async () => {
  const valid = await changePlanFormRef.value?.validate().then(
    () => true,
    () => false
  );
  if (!valid) return;

  changePlanSubmitting.value = true;
  try {
    await TenantAPI.update(changePlanTenant.id, { planId: changePlanForm.planId });
    ElMessage.success("更换套餐成功");
    closeChangePlanDialog();
    handleResetQuery();
  } finally {
    changePlanSubmitting.value = false;
  }
}, 300);

/**
 * 打开菜单配置抽屉并回显已分配菜单
 *
 * @param row 当前租户行
 */
async function handleAssignMenuClick(row) {
  if (!row.id || isPlatformTenantId(row.id)) return;

  menuDialogVisible.value = true;
  checkedTenant.value = { id: row.id, name: row.name };

  loading.value = true;
  try {
    const [menuOptions, menuIds] = await Promise.all([
      MenuAPI.getOptions(false, MenuScopeEnum.TENANT),
      TenantAPI.getTenantMenuIds(row.id),
    ]);

    menuPermOptions.value = menuOptions;
    await nextTick();

    menuTreeRef.value?.setCheckedKeys([], false);
    menuIds.forEach((menuId) => menuTreeRef.value?.setChecked(menuId, true, false));
  } finally {
    loading.value = false;
  }
}

/**
 * 关闭菜单配置抽屉
 */
function closeMenuDialog() {
  menuDialogVisible.value = false;
  menuKeywords.value = "";
  menuExpanded.value = true;
  menuParentChildLinked.value = true;
  menuTreeRef.value?.setCheckedKeys([], false);
}

/**
 * 展开或收起菜单树全部节点
 */
function toggleMenuTree() {
  menuExpanded.value = !menuExpanded.value;
  if (!menuTreeRef.value) return;

  Object.values(menuTreeRef.value.store.nodesMap).forEach((node) => {
    if (menuExpanded.value) {
      node.expand();
    } else {
      node.collapse();
    }
  });
}

/**
 * 父子联动开关变化处理
 *
 * @param val 开关当前值
 */
function handleMenuLinkChange(val) {
  menuParentChildLinked.value = Boolean(val);
}

/**
 * 菜单树过滤函数
 *
 * @param value 输入的关键字
 * @param data 当前节点数据
 */
function handleMenuFilter(value, data) {
  if (!value) return true;
  return String(data.label ?? "").includes(value);
}

/**
 * 提交租户菜单权限配置
 */
async function handleMenuSubmit() {
  const tenantId = checkedTenant.value.id;
  if (!tenantId) return;

  const checkedMenuIds = (menuTreeRef.value?.getCheckedNodes(false, true) ?? [])
    .map((node) => Number(node.value))
    .filter((value) => !Number.isNaN(value));

  loading.value = true;
  try {
    await TenantAPI.updateTenantMenus(tenantId, checkedMenuIds);
    ElMessage.success("菜单配置成功");
    menuDialogVisible.value = false;
  } finally {
    loading.value = false;
  }
}

watch(menuKeywords, (val) => {
  menuTreeRef.value?.filter(val);
});

onMounted(() => {
  fetchData();
});
</script>
