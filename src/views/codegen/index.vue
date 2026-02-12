<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="表名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleQuery">
            <template #icon>
              <Search />
            </template>
            搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <template #icon>
              <Refresh />
            </template>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="table-card">
      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        class="data-table__content"
        highlight-current-row
        border
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="表名" prop="tableName" min-width="100" />
        <el-table-column label="描述" prop="tableComment" width="150" />

        <el-table-column label="存储引擎" align="center" prop="engine" />

        <el-table-column label="排序规则" align="center" prop="tableCollation" />
        <el-table-column label="创建时间" align="center" prop="createTime" />

        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.tableName)"
            >
              <template #icon>
                <MagicStick />
              </template>
              生成代码
            </el-button>

            <el-button
              v-if="scope.row.isConfigured === 1"
              type="danger"
              size="small"
              link
              @click="handleResetConfig(scope.row.tableName)"
            >
              <template #icon>
                <RefreshLeft />
              </template>
              重置配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery"
      />
    </el-card>

    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      size="80%"
      @close="dialog.visible = false"
    >
      <el-steps :active="active" align-center finish-status="success" simple>
        <el-step title="基础配置" />
        <el-step title="字段配置" />
        <el-step title="预览生成" />
      </el-steps>

      <div class="mt-5">
        <el-form
          v-show="active == 0"
          :model="genConfigFormData"
          :label-width="100"
          :rules="genConfigFormRules"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="表名" prop="tableName">
                <el-input v-model="genConfigFormData.tableName" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="业务名" prop="businessName">
                <el-input v-model="genConfigFormData.businessName" placeholder="用户" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="主包名" prop="packageName">
                <el-input v-model="genConfigFormData.packageName" placeholder="com.youlai.boot" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块名" prop="moduleName">
                <el-input v-model="genConfigFormData.moduleName" placeholder="system" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="实体名" prop="entityName">
                <el-input v-model="genConfigFormData.entityName" placeholder="User" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="作者">
                <el-input v-model="genConfigFormData.author" placeholder="youlai" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <div class="flex-y-between">
                    <span>上级菜单</span>
                    <el-tooltip effect="dark">
                      <template #content>
                        选择上级菜单，生成代码后会自动创建对应菜单。
                        <br />
                        注意1：生成菜单后需分配权限给角色，否则菜单将无法显示。
                        <br />
                        注意2：演示环境默认不生成菜单，如需生成，请在本地部署数据库。
                      </template>
                      <el-icon class="cursor-pointer">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </template>

                <el-tree-select
                  v-model="genConfigFormData.parentMenuId"
                  placeholder="选择上级菜单"
                  :data="menuOptions"
                  check-strictly
                  :render-after-expand="false"
                  filterable
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <div v-show="active == 1" class="elTableCustom">
          <div class="mb-2 flex-y-center gap-2">
            <el-tag size="small" type="info">批量设置</el-tag>
            <el-space size="small">
              <el-dropdown>
                <el-button size="small" type="primary" plain>查询</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="bulkSet('isShowInQuery', 1)">全选</el-dropdown-item>
                    <el-dropdown-item @click="bulkSet('isShowInQuery', 0)">全不选</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-dropdown>
                <el-button size="small" type="success" plain>列表</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="bulkSet('isShowInList', 1)">全选</el-dropdown-item>
                    <el-dropdown-item @click="bulkSet('isShowInList', 0)">全不选</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-dropdown>
                <el-button size="small" type="warning" plain>表单</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="bulkSet('isShowInForm', 1)">全选</el-dropdown-item>
                    <el-dropdown-item @click="bulkSet('isShowInForm', 0)">全不选</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </div>
          <el-table
            v-loading="loading"
            row-key="id"
            :element-loading-text="loadingText"
            highlight--currentrow
            :data="genConfigFormData.fieldConfigs"
          >
            <el-table-column width="55" align="center">
              <el-icon class="cursor-move sortable-handle">
                <Rank />
              </el-icon>
            </el-table-column>

            <el-table-column label="列名" width="110">
              <template #default="scope">
                {{ scope.row.columnName }}
              </template>
            </el-table-column>

            <el-table-column label="列类型" width="80">
              <template #default="scope">
                {{ scope.row.columnType }}
              </template>
            </el-table-column>
            <el-table-column label="字段名" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.fieldName" />
              </template>
            </el-table-column>
            <el-table-column label="字段类型" width="80">
              <template #default="scope">
                {{ scope.row.fieldType }}
              </template>
            </el-table-column>

            <el-table-column label="字段注释" min-width="100">
              <template #default="scope">
                <el-input v-model="scope.row.fieldComment" />
              </template>
            </el-table-column>

            <el-table-column label="最大长度" width="80">
              <template #default="scope">
                <el-input v-model="scope.row.maxLength" />
              </template>
            </el-table-column>

            <el-table-column width="70" label="查询">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isShowInQuery" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>

            <el-table-column width="70" label="列表">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isShowInList" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>

            <el-table-column width="70" label="表单">
              <template #default="scope">
                <el-checkbox v-model="scope.row.isShowInForm" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>

            <el-table-column label="必填" width="70">
              <template #default="scope">
                <el-checkbox
                  v-if="scope.row.isShowInForm == 1"
                  v-model="scope.row.isRequired"
                  :true-value="1"
                  :false-value="0"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="查询方式" min-width="120">
              <template #default="scope">
                <el-select
                  v-if="scope.row.isShowInQuery === 1"
                  v-model="scope.row.queryType"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, key) in queryTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="表单类型" min-width="120">
              <template #default="scope">
                <el-select
                  v-if="scope.row.isShowInQuery === 1 || scope.row.isShowInForm === 1"
                  v-model="scope.row.formType"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(item, key) in formTypeOptions"
                    :key="key"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column label="字典类型" min-width="100">
              <template #default="scope">
                <el-select
                  v-if="scope.row.formType === FormTypeEnum.SELECT.value"
                  v-model="scope.row.dictType"
                  placeholder="请选择"
                  clearable
                >
                  <el-option
                    v-for="item in dictOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-row v-show="active == 2">
          <el-col :span="24" class="mb-2">
            <div class="flex-y-center gap-3">
              <span class="text-sm color-#909399">预览范围</span>
              <el-radio-group v-model="previewScope" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="frontend">前端</el-radio-button>
                <el-radio-button value="backend">后端</el-radio-button>
              </el-radio-group>
              <span class="ml-3 text-sm color-#909399">类型</span>
              <el-checkbox-group v-model="previewTypes" size="small">
                <el-checkbox-button v-for="t in previewTypeOptions" :key="t" :value="t">
                  {{ t }}
                </el-checkbox-button>
              </el-checkbox-group>
            </div>
          </el-col>
          <el-col :span="6">
            <el-scrollbar max-height="72vh">
              <el-tree
                :data="filteredTreeData"
                default-expand-all
                highlight-current
                @node-click="handleFileTreeNodeClick"
              >
                <template #default="{ data }">
                  <div :class="`i-svg:${getFileTreeNodeIcon(data)}`" />
                  <span class="ml-1">{{ data.label }}</span>
                </template>
              </el-tree>
            </el-scrollbar>
          </el-col>
          <el-col :span="18">
            <el-scrollbar max-height="72vh">
              <div class="absolute z-36 right-5 top-2">
                <el-link type="primary" @click="handleCopyCode">
                  <el-icon>
                    <CopyDocument />
                  </el-icon>
                  一键复制
                </el-link>
              </div>

              <Codemirror
                ref="cmRef"
                v-model:value="code"
                :options="cmOptions"
                border
                :readonly="true"
                height="100%"
                width="100%"
              />
            </el-scrollbar>
          </el-col>
        </el-row>
      </div>

      <template #footer>
        <el-button v-if="active !== 0" type="success" @click="handlePrevClick">
          <el-icon>
            <Back />
          </el-icon>
          {{ prevBtnText }}
        </el-button>
        <el-button type="primary" @click="handleNextClick">
          {{ nextBtnText }}
          <el-icon v-if="active !== 2">
            <Right />
          </el-icon>
          <el-icon v-else>
            <Download />
          </el-icon>
        </el-button>
        <el-button
          v-if="active === 2"
          :disabled="!supportsFSAccess"
          type="primary"
          plain
          @click="openWriteDialog"
        >
          <template #icon>
            <el-icon><FolderOpened /></el-icon>
          </template>
          写入本地
        </el-button>
      </template>
    </el-drawer>
    <!-- 写入本地对话框 -->
    <el-dialog v-model="writeDialog.visible" title="写入本地" width="820px">
      <div class="space-y-3">
        <el-alert
          v-if="!supportsFSAccess"
          title="当前浏览器不支持 File System Access API，建议使用 Chrome/Edge 最新版"
          type="warning"
          show-icon
          :closable="false"
        />

        <el-form :label-width="110">
          <el-form-item label="前端根目录">
            <div class="flex-y-center gap-2">
              <el-input v-model="frontendDirPath" placeholder="请选择前端根目录" readonly />
              <el-button :disabled="!supportsFSAccess" @click="pickFrontendDir">选择</el-button>
            </div>
          </el-form-item>
          <el-form-item label="后端根目录">
            <div class="flex-y-center gap-2">
              <el-input v-model="backendDirPath" placeholder="请选择后端根目录" readonly />
              <el-button :disabled="!supportsFSAccess" @click="pickBackendDir">选择</el-button>
            </div>
          </el-form-item>
          <el-form-item label="写入范围">
            <el-radio-group v-model="writeScope">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="frontend">仅前端</el-radio-button>
              <el-radio-button value="backend">仅后端</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="覆盖策略">
            <el-radio-group v-model="overwriteMode">
              <el-radio-button value="overwrite">覆盖</el-radio-button>
              <el-radio-button value="skip">跳过已存在</el-radio-button>
              <el-radio-button value="ifChanged">仅在变更时覆盖</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div v-if="writeProgress.total > 0" class="mt-2">
          <el-progress :text-inside="true" :stroke-width="16" :percentage="writeProgress.percent" />
          <div class="mt-1 text-sm color-#909399">
            {{ writeProgress.done }}/{{ writeProgress.total }} {{ writeProgress.current }}
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="writeDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!canWriteToLocal || writeRunning"
          @click="confirmWrite"
        >
          写入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: "Codegen",
});

import Sortable from "sortablejs";
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";
import { useClipboard } from "@vueuse/core";

import { FormTypeEnum, QueryTypeEnum } from "@/enums/codegen";

import GeneratorAPI from "@/api/codegen";
import DictAPI from "@/api/system/dict";
import MenuAPI from "@/api/system/menu";
import { ElLoading } from "element-plus";

const treeData = ref([]);
const previewScope = ref("all");
const previewTypeOptions = ref([]);
const previewTypes = ref([]);
const frontendType = "js";

const filteredTreeData = computed(() => {
  if (!treeData.value.length) return [];
  const match = (node) => {
    if (previewScope.value !== "all") {
      if (node.scope !== previewScope.value) return false;
    }
    if (!previewTypes.value.length) return true;
    const language = node.language || node.label.split(".").pop() || "";
    return previewTypes.value.includes(language);
  };

  const cloneFilter = (node) => {
    if (!node.children || node.children.length === 0) {
      return match(node) ? { ...node } : null;
    }
    const children = (node.children || []).map((c) => cloneFilter(c)).filter(Boolean);
    if (!children.length) return null;
    return { label: node.label, children };
  };

  return treeData.value.map((n) => cloneFilter(n)).filter(Boolean);
});

const queryFormRef = ref();
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

const loading = ref(false);
const loadingText = ref("loading...");

const pageData = ref([]);
const total = ref(0);

const dialog = reactive({
  visible: false,
  title: "",
});

const active = ref(0);

watch(
  () => genConfigFormData.value.removeTablePrefix,
  (prefix) => {
    const table = genConfigFormData.value.tableName;
    if (!table) return;
    const p = prefix || "";
    const base = table.startsWith(p) ? table.slice(p.length) : table;
    const camel = base
      .split("_")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join("");
    genConfigFormData.value.entityName = camel;
  }
);

const genConfigFormData = ref({
  fieldConfigs: [],
  pageType: "classic",
});

const genConfigFormRules = {
  tableName: [{ required: true, message: "请输入表名", trigger: "blur" }],
  businessName: [{ required: true, message: "请输入业务名", trigger: "blur" }],
  packageName: [{ required: true, message: "请输入主包名", trigger: "blur" }],
  moduleName: [{ required: true, message: "请输入模块名", trigger: "blur" }],
  entityName: [{ required: true, message: "请输入实体名", trigger: "blur" }],
};

const currentTableName = ref("");

const isCheckAllQuery = ref(false);
const isCheckAllList = ref(false);
const isCheckAllForm = ref(false);

const sortFlag = ref(null);

const supportsFSAccess = typeof window.showDirectoryPicker === "function";
const outputMode = ref("zip");
const frontendDirHandle = ref(null);
const backendDirHandle = ref(null);
const frontendDirName = ref("");
const backendDirName = ref("");
const lastPreviewFiles = ref([]);
const needFrontend = computed(() =>
  lastPreviewFiles.value.some((f) => resolveRootForItem(f) === "frontend")
);
const needBackend = computed(() =>
  lastPreviewFiles.value.some((f) => resolveRootForItem(f) === "backend")
);
const canWriteToLocal = computed(() => {
  if (!lastPreviewFiles.value.length) return false;
  const frontOk = needFrontend.value ? !!frontendDirHandle.value : true;
  const backOk = needBackend.value ? !!backendDirHandle.value : true;
  return frontOk && backOk;
});

const formTypeOptions = FormTypeEnum;
const queryTypeOptions = QueryTypeEnum;
const dictOptions = ref();
const menuOptions = ref([]);

const { copy, copied } = useClipboard();
const code = ref("");
const cmRef = ref();
const cmOptions = {
  mode: "text/javascript",
};

const prevBtnText = ref("");
const nextBtnText = ref("下一步，字段配置");

watch(active, (val) => {
  if (val === 0) {
    nextBtnText.value = "下一步，字段配置";
  } else if (val === 1) {
    prevBtnText.value = "上一步，基础配置";
    nextBtnText.value = "下一步，确认生成";
    nextTick(() => {
      initSort();
    });
  } else if (val === 2) {
    prevBtnText.value = "上一步，字段配置";
    nextBtnText.value = "下载代码";
  }
});

watch(
  () => dialog.visible,
  (visible) => {
    if (!visible) {
      destroySort();
    }
  }
);

watch(copied, () => {
  if (copied.value) {
    ElMessage.success("复制成功");
  }
});

watch(
  () => genConfigFormData.value.fieldConfigs,
  (newVal) => {
    newVal.forEach((fieldConfig) => {
      if (
        fieldConfig.fieldType &&
        fieldConfig.fieldType.includes("Date") &&
        fieldConfig.isShowInQuery === 1 &&
        fieldConfig.queryType == null
      ) {
        fieldConfig.queryType = QueryTypeEnum.BETWEEN.value;
      }
    });
  },
  { deep: true, immediate: true }
);

function destroySort() {
  if (!sortFlag.value) return;
  sortFlag.value.destroy();
  sortFlag.value = null;
}

const initSort = () => {
  if (sortFlag.value) return;
  const table = document.querySelector(".elTableCustom .el-table__body-wrapper tbody");
  if (!table) return;
  sortFlag.value = Sortable.create(table, {
    group: "shared",
    animation: 150,
    ghostClass: "sortable-ghost",
    handle: ".sortable-handle",
    easing: "cubic-bezier(1, 0, 0, 1)",
    onEnd: (item) => {
      setNodeSort(item.oldIndex, item.newIndex);
    },
  });
};

const setNodeSort = (oldIndex, newIndex) => {
  const list = genConfigFormData.value?.fieldConfigs ?? [];
  if (!list || oldIndex === newIndex) return;
  const [item] = list.splice(oldIndex, 1);
  list.splice(newIndex, 0, item);
};

function handlePrevClick() {
  if (active.value === 2) {
    genConfigFormData.value = {
      fieldConfigs: [],
    };
    nextTick(() => {
      loading.value = true;
      GeneratorAPI.getGenConfig(currentTableName.value)
        .then((data) => {
          genConfigFormData.value = data;
        })
        .finally(() => {
          loading.value = false;
        });
    });
  }
  if (active.value-- <= 0) active.value = 0;
}

function handleNextClick() {
  if (active.value === 0) {
    const { tableName, packageName, businessName, moduleName, entityName } =
      genConfigFormData.value;
    if (!tableName || !packageName || !businessName || !moduleName || !entityName) {
      ElMessage.error("表名、业务名、包名、模块名、实体名不能为空");
      return;
    }
  }
  if (active.value === 1) {
    const tableName = genConfigFormData.value.tableName;
    if (!tableName) {
      ElMessage.error("表名不能为空");
      return;
    }
    loading.value = true;
    loadingText.value = "代码生成中，请稍候...";
    GeneratorAPI.saveGenConfig(tableName, genConfigFormData.value)
      .then(() => handlePreview(tableName))
      .then(() => {
        if (active.value++ >= 2) active.value = 2;
      })
      .finally(() => {
        loading.value = false;
        loadingText.value = "loading...";
      });
  } else {
    if (active.value++ >= 2) {
      active.value = 2;
    }
    if (active.value === 2) {
      const tableName = genConfigFormData.value.tableName;
      if (!tableName) {
        ElMessage.error("表名不能为空");
        return;
      }
      if (outputMode.value === "zip" || !supportsFSAccess) {
        GeneratorAPI.download(
          tableName,
          genConfigFormData.value.pageType || "classic",
          frontendType
        );
      }
    }
  }
}

function handleQuery() {
  loading.value = true;
  GeneratorAPI.getTablePage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total ?? 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

async function handleOpenDialog(tableName) {
  dialog.visible = true;
  active.value = 0;
  currentTableName.value = tableName;
  loading.value = true;
  try {
    const [menuList, dictList, config] = await Promise.all([
      MenuAPI.getOptions(true),
      DictAPI.getList(),
      GeneratorAPI.getGenConfig(tableName),
    ]);

    menuOptions.value = menuList;
    dictOptions.value = dictList;
    dialog.title = `${tableName} 代码生成`;
    genConfigFormData.value = config;

    checkAllSelected("isShowInQuery", isCheckAllQuery);
    checkAllSelected("isShowInList", isCheckAllList);
    checkAllSelected("isShowInForm", isCheckAllForm);

    if (genConfigFormData.value.id) {
      active.value = 2;
      await handlePreview(tableName);
    }
  } catch {
    ElMessage.error("获取生成配置失败");
    dialog.visible = false;
  } finally {
    loading.value = false;
  }
}

function handleResetConfig(tableName) {
  ElMessageBox.confirm("确定要重置配置吗？", "提示", {
    type: "warning",
  }).then(() => {
    GeneratorAPI.resetGenConfig(tableName).then(() => {
      ElMessage.success("重置成功");
      handleQuery();
    });
  });
}

function bulkSet(key, value) {
  const list = genConfigFormData.value?.fieldConfigs || [];
  list.forEach((row) => {
    row[key] = value;
  });
}

const checkAllSelected = (key, isCheckAllRef) => {
  const fieldConfigs = genConfigFormData.value?.fieldConfigs || [];
  isCheckAllRef.value = fieldConfigs.every((row) => row[key] === 1);
};

async function handlePreview(tableName) {
  treeData.value = [];
  try {
    const data = await GeneratorAPI.getPreviewData(
      tableName,
      genConfigFormData.value.pageType || "classic",
      frontendType
    );
    dialog.title = `代码生成 ${tableName}`;
    const previewList = data || [];
    const typeOptions = Array.from(
      new Set(
        previewList
          .map((item) => item.language || item.fileName.split(".").pop() || "")
          .filter(Boolean)
      )
    );
    previewTypeOptions.value = typeOptions;
    previewTypes.value = [...typeOptions];

    const tree = buildTree(previewList);
    lastPreviewFiles.value = previewList;
    treeData.value = tree?.children ? [...tree.children] : [];

    const firstLeafNode = findFirstLeafNode(tree);
    if (firstLeafNode) {
      code.value = firstLeafNode.content || "";
    }
  } catch {
    active.value = 0;
    throw new Error("preview_failed");
  }
}

function buildTree(data) {
  const root = { label: "前后端代码", children: [] };

  data.forEach((item) => {
    const normalizedPath = item.path.replace(/\\/g, "/");
    const parts = normalizedPath.split("/").filter(Boolean);

    let currentNode = root;

    parts.forEach((part) => {
      let node = currentNode.children?.find((child) => child.label === part);
      if (!node) {
        node = { label: part, children: [] };
        currentNode.children?.push(node);
      }
      currentNode = node;
    });

    currentNode.children?.push({
      label: item.fileName,
      content: item?.content,
      scope: item.scope,
      language: item.language,
    });
  });

  return root;
}

function findFirstLeafNode(node) {
  if (!node.children || node.children.length === 0) {
    return node;
  }
  for (const child of node.children) {
    const leafNode = findFirstLeafNode(child);
    if (leafNode) {
      return leafNode;
    }
  }
  return null;
}

function handleFileTreeNodeClick(data) {
  if (!data.children || data.children.length === 0) {
    code.value = data.content || "";
  }
}

function getFileTreeNodeIcon(node) {
  const ext = (node.language || node.label.split(".").pop() || "").toLowerCase();
  if (ext === "java") {
    return "java";
  }
  if (ext === "html") {
    return "html";
  }
  if (ext === "vue") {
    return "vue";
  }
  if (ext === "ts") {
    return "typescript";
  }
  if (ext === "xml") {
    return "xml";
  }
  if (["cs", "go", "py", "php", "js"].includes(ext)) {
    return "code";
  }
  return "file";
}

const handleCopyCode = () => {
  if (code.value) {
    copy(code.value);
  }
};

const pickFrontendDir = async () => {
  try {
    frontendDirHandle.value = await window.showDirectoryPicker();
    frontendDirName.value = frontendDirHandle.value?.name || "";
    ElMessage.success("前端目录选择成功");
  } catch {
    // 用户取消或浏览器不支持
  }
};

const pickBackendDir = async () => {
  try {
    backendDirHandle.value = await window.showDirectoryPicker();
    backendDirName.value = backendDirHandle.value?.name || "";
    ElMessage.success("后端目录选择成功");
  } catch {
    // 用户取消或浏览器不支持
  }
};

async function ensureDir(root, path, create = true) {
  let current = root;
  for (const segment of path) {
    current = await current.getDirectoryHandle(segment, { create });
  }
  return current;
}

async function writeFile(dirHandle, filePath, content) {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);
  const fileName = parts.pop();
  const folderSegments = parts;
  const targetDir = await ensureDir(dirHandle, folderSegments, true);
  let fileHandle;
  try {
    fileHandle = await targetDir.getFileHandle(fileName, { create: true });
  } catch (err) {
    if (err?.name === "TypeMismatchError") {
      throw err;
    } else {
      throw err;
    }
  }
  const writable = await fileHandle.createWritable();
  await writable.write(content ?? "");
  await writable.close();
}

async function pathExists(dirHandle, filePath) {
  try {
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const fileName = parts.pop();
    const targetDir = await ensureDir(dirHandle, parts, false);
    await targetDir.getFileHandle(fileName, { create: false });
    return true;
  } catch {
    return false;
  }
}

async function isSameFile(dirHandle, filePath, content) {
  try {
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    const fileName = parts.pop();
    const targetDir = await ensureDir(dirHandle, parts, false);
    const fileHandle = await targetDir.getFileHandle(fileName, { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    return text === (content ?? "");
  } catch {
    return false;
  }
}

function resolveRootForItem(item) {
  if (item.scope === "backend") {
    return "backend";
  }
  return "frontend";
}

function stripProjectRoot(p) {
  const normalized = p.replace(/\\/g, "/");
  const frontApp = genConfigFormData.value.frontendAppName;
  const backApp = genConfigFormData.value.backendAppName;
  let rel = normalized;
  if (frontApp && normalized.startsWith(`${frontApp}/`)) {
    rel = normalized.slice(frontApp.length + 1);
  } else if (backApp && normalized.startsWith(`${backApp}/`)) {
    rel = normalized.slice(backApp.length + 1);
  } else {
    const idx = normalized.indexOf("/src/");
    if (idx > -1) {
      rel = normalized.slice(idx + 1);
    } else if (normalized.startsWith("src/")) {
      rel = normalized;
    }
  }
  return rel;
}

const writeGeneratedCode = async () => {
  if (!supportsFSAccess) {
    ElMessage.warning("当前浏览器不支持本地写入，请选择下载ZIP");
    return;
  }
  if (
    (needFrontend.value && !frontendDirHandle.value) ||
    (needBackend.value && !backendDirHandle.value)
  ) {
    ElMessage.warning("请先选择所需的前/后端目录");
    return;
  }
  if (!lastPreviewFiles.value.length) {
    ElMessage.warning("请先生成预览");
    return;
  }
  loading.value = true;
  const loadingSvc = ElLoading.service({
    lock: true,
    text: "正在写入代码...",
  });
  writeRunning.value = true;
  let frontCount = 0;
  let backCount = 0;
  const failed = [];
  const files = lastPreviewFiles.value.filter((f) => {
    const root = resolveRootForItem(f);
    return writeScope.value === "all" || root === writeScope.value;
  });
  writeProgress.total = files.length;
  writeProgress.done = 0;
  writeProgress.percent = 0;
  writeProgress.current = "";

  const concurrency = 4;
  const queue = files.slice();
  const workers = [];

  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      try {
        const root = resolveRootForItem(item);
        const relativePath = stripProjectRoot(`${item.path}/${item.fileName}`);
        writeProgress.current = relativePath;
        if (overwriteMode.value === "ifChanged") {
          const targetRoot = root === "frontend" ? frontendDirHandle.value : backendDirHandle.value;
          const existsSame = await isSameFile(targetRoot, relativePath, item.content || "");
          if (existsSame) {
            writeProgress.done++;
            writeProgress.percent = Math.round((writeProgress.done / writeProgress.total) * 100);
            continue;
          }
        }
        if (overwriteMode.value === "skip") {
          const targetRoot = root === "frontend" ? frontendDirHandle.value : backendDirHandle.value;
          const exists = await pathExists(targetRoot, relativePath);
          if (exists) {
            writeProgress.done++;
            writeProgress.percent = Math.round((writeProgress.done / writeProgress.total) * 100);
            continue;
          }
        }
        if (root === "frontend") {
          await writeFile(frontendDirHandle.value, relativePath, item.content || "");
          frontCount++;
        } else {
          await writeFile(backendDirHandle.value, relativePath, item.content || "");
          backCount++;
        }
      } catch (err) {
        console.error("写入失败:", item.path, err);
        failed.push(item.path);
      } finally {
        writeProgress.done++;
        writeProgress.percent = Math.round((writeProgress.done / writeProgress.total) * 100);
      }
    }
  }

  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  loading.value = false;
  loadingSvc.close();
  writeRunning.value = false;
  if (failed.length) {
    ElMessage.warning(
      `部分文件写入失败 ${failed.length} 个，成功 前端 ${frontCount} 个，后端 ${backCount} 个。打开控制台查看详情`
    );
  } else {
    ElMessage.success(`写入完成：前端 ${frontCount} 个文件，后端 ${backCount} 个文件`);
  }
};

const writeDialog = reactive({ visible: false });
const frontendDirPath = ref("");
const backendDirPath = ref("");
const writeScope = ref("all");
const overwriteMode = ref("overwrite");
const writeProgress = reactive({ total: 0, done: 0, percent: 0, current: "" });
const writeRunning = ref(false);

function openWriteDialog() {
  writeDialog.visible = true;
}

watch(frontendDirName, (v) => (frontendDirPath.value = v));
watch(backendDirName, (v) => (backendDirPath.value = v));

async function confirmWrite() {
  await writeGeneratedCode();
  writeDialog.visible = false;
}

onMounted(() => {
  handleQuery();
});

onBeforeUnmount(() => {
  cmRef.value?.destroy();
  destroySort();
});
</script>
