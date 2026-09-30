<template>
  <div ref="tableSelectRef" :style="'width:' + width">
    <el-popover
      :visible="popoverVisible"
      :width="popoverWidth"
      placement="bottom-end"
      v-bind="selectConfig.popover"
      @show="handleShow"
    >
      <template #reference>
        <div @click="popoverVisible = !popoverVisible">
          <slot>
            <el-input
              class="reference"
              :model-value="text"
              :readonly="true"
              :placeholder="placeholder"
            >
              <template #suffix>
                <el-icon
                  :style="{
                    transform: popoverVisible ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform .5s',
                  }"
                >
                  <ArrowDown />
                </el-icon>
              </template>
            </el-input>
          </slot>
        </div>
      </template>
      <!-- 弹出框内 -->
      <div ref="popoverContentRef">
        <!-- 表单 -->
        <el-form ref="formRef" :model="queryParams" :inline="true">
          <template v-for="item in selectConfig.formItems" :key="item.prop">
            <el-form-item :label="item.label" :prop="item.prop">
              <!-- Input 输入 -->
              <template v-if="item.type === 'input'">
                <template v-if="item.attrs?.type === 'number'">
                  <el-input
                    v-model.number="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
                <template v-else>
                  <el-input
                    v-model="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
              </template>
              <!-- Select 选择 -->
              <template v-else-if="item.type === 'select'">
                <el-select v-model="queryParams[item.prop]" v-bind="item.attrs">
                  <template v-for="option in item.options" :key="option.value">
                    <el-option :label="option.label" :value="option.value" />
                  </template>
                </el-select>
              </template>
              <!-- TreeSelect 树形选择 -->
              <template v-else-if="item.type === 'tree-select'">
                <el-tree-select v-model="queryParams[item.prop]" v-bind="item.attrs" />
              </template>
              <!-- DatePicker 日期选择 -->
              <template v-else-if="item.type === 'date-picker'">
                <el-date-picker v-model="queryParams[item.prop]" v-bind="item.attrs" />
              </template>
              <!-- Input 输入 -->
              <template v-else>
                <template v-if="item.attrs?.type === 'number'">
                  <el-input
                    v-model.number="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
                <template v-else>
                  <el-input
                    v-model="queryParams[item.prop]"
                    v-bind="item.attrs"
                    @keyup.enter="handleQuery"
                  />
                </template>
              </template>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <!-- 列表 -->
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="pageData"
          :border="true"
          :max-height="250"
          :row-key="pk"
          :highlight-current-row="true"
          :class="{ radio: !isMultiple }"
          @select="handleSelect"
          @select-all="handleSelectAll"
        >
          <template v-for="col in selectConfig.tableColumns" :key="col.prop">
            <!-- 自定义 -->
            <template v-if="col.templet === 'custom'">
              <el-table-column v-bind="col">
                <template #default="scope">
                  <slot :name="col.slotName ?? col.prop" :prop="col.prop" v-bind="scope" />
                </template>
              </el-table-column>
            </template>
            <!-- 其他 -->
            <template v-else>
              <el-table-column v-bind="col" />
            </template>
          </template>
        </el-table>
        <!-- 分页 -->
        <pagination
          v-if="total > 0"
          v-model:total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="handlePagination"
        />
        <div class="feedback">
          <el-button type="primary" size="small" @click="handleConfirm">
            {{ confirmText }}
          </el-button>
          <el-button size="small" @click="handleClear">清空</el-button>
          <el-button size="small" @click="handleClose">关闭</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useResizeObserver } from "@vueuse/core";
/**
 * 表格选择器：弹窗表格选数据回填
 */
const props = defineProps({
  selectConfig: {
    type: Object,
    required: false,
    default: () => ({
      width: "100%",
      placeholder: "请选择",
      popover: {},
      indexAction: () => Promise.resolve(),
      pk: "id",
      multiple: false,
      formItems: [],
      tableColumns: [],
    }),
  },
  text: {
    type: String,
    default: "",
  },
});
/**
 * 自定义事件
 */
const emit = defineEmits(["confirmClick"]);
// 主键
const pk = props.selectConfig.pk ?? "id";
// 是否多选
const isMultiple = props.selectConfig.multiple === true;
// 宽度
const width = props.selectConfig.width ?? "100%";
// 占位符
const placeholder = props.selectConfig.placeholder ?? "请选择";
// 是否显示弹出框
const popoverVisible = ref(false);
// 加载状态
const loading = ref(false);
// 数据总数
const total = ref(0);
// 列表数据
const pageData = ref([]);
// 每页条数
const pageSize = 10;
// 搜索参数
const queryParams = reactive({
  pageNum: 1,
  pageSize,
});
// 计算 popover 的宽度
const tableSelectRef = ref();
const popoverWidth = ref(width);
useResizeObserver(tableSelectRef, (entries) => {
  popoverWidth.value = `${entries[0].contentRect.width}px`;
});
// 表单操作
const formRef = ref();
// 初始化搜索条件
for (const item of props.selectConfig.formItems) {
  queryParams[item.prop] = item.initialValue ?? "";
}
/**
 * 重置操作
 */
function handleReset() {
  formRef.value?.resetFields();
  fetchPageData(true);
}
/**
 * 查询操作
 */
function handleQuery() {
  fetchPageData(true);
}
/**
 * 获取分页数据
 */
function fetchPageData(isRestart = false) {
  loading.value = true;
  if (isRestart) {
    queryParams.pageNum = 1;
    queryParams.pageSize = pageSize;
  }
  props.selectConfig
    .indexAction(queryParams)
    .then((data) => {
      total.value = data.total ?? 0;
      pageData.value = data.list ?? [];
    })
    .finally(() => {
      loading.value = false;
    });
}
// 列表操作
const tableRef = ref();
// 数据刷新后是否保留选项
for (const item of props.selectConfig.tableColumns) {
  if (item.type === "selection") {
    item.reserveSelection = true;
    break;
  }
}
// 选择
const selectedItems = ref([]);
const confirmText = computed(() => {
  return selectedItems.value.length > 0 ? `已选${selectedItems.value.length}条` : "请选择";
});
/**
 * 处理表格单选与多选
 */
function handleSelect(selection) {
  if (isMultiple || selection.length === 0) {
    // 多选
    selectedItems.value = selection;
  } else {
    // 单选
    selectedItems.value = [selection[selection.length - 1]];
    tableRef.value?.clearSelection();
    tableRef.value?.toggleRowSelection(selectedItems.value[0], true);
    tableRef.value?.setCurrentRow(selectedItems.value[0]);
  }
}
/**
 * 处理表格全选
 */
function handleSelectAll(selection) {
  if (isMultiple) {
    selectedItems.value = selection;
  }
}
/**
 * 分页
 */
function handlePagination() {
  fetchPageData();
}
// 弹出框
const isInit = ref(false);
/**
 * 显示
 */
function handleShow() {
  if (isInit.value === false) {
    isInit.value = true;
    fetchPageData();
  }
}
/**
 * 确定
 */
function handleConfirm() {
  if (selectedItems.value.length === 0) {
    ElMessage.error("请选择数据");
    return;
  }
  popoverVisible.value = false;
  emit("confirmClick", selectedItems.value);
}
/**
 * 清空
 */
function handleClear() {
  tableRef.value?.clearSelection();
  selectedItems.value = [];
}
/**
 * 关闭
 */
function handleClose() {
  popoverVisible.value = false;
}
const popoverContentRef = ref();
/* onClickOutside(tableSelectRef, () => (popoverVisible.value = false), {
  ignore: [popoverContentRef],
}); */
</script>

<style scoped lang="scss">
.reference :deep(.el-input__wrapper),
.reference :deep(.el-input__inner) {
  cursor: pointer;
}

.feedback {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}
// 隐藏全选按钮
.radio :deep(.el-table__header th.el-table__cell:nth-child(1) .el-checkbox) {
  visibility: hidden;
}
</style>
