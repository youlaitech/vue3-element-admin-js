<template>
  <div class="page-container">
    <CrudSearch
      v-if="searchConfig"
      ref="searchRef"
      :search-config="searchConfig"
      @search="search"
      @reset="resetSearch"
    >
      <template v-for="name in getSlotNames('search-')" #[name]="scope">
        <slot :name="'search-' + name" v-bind="scope" />
      </template>
    </CrudSearch>
    <CrudTable
      ref="tableRef"
      :table-config="tableConfig"
      :auto-load="false"
      @create="handleCreate"
      @toggle-search="toggleSearch"
      @filter-change="applyFilters"
      @toolbar-action="emit('toolbar-action', $event)"
      @row-action="handleRowAction"
    >
      <template v-for="name in getSlotNames('table-')" #[name]="scope">
        <slot :name="'table-' + name" v-bind="scope" />
      </template>
    </CrudTable>
    <CrudForm
      v-if="resolvedFormConfig"
      ref="formRef"
      :form-config="resolvedFormConfig"
      @saved="handleSaved"
    >
      <template v-for="name in getSlotNames('form-')" #[name]="scope">
        <slot :name="'form-' + name" v-bind="scope" />
      </template>
    </CrudForm>
  </div>
</template>

<script setup>
import { computed, onMounted, useSlots } from "vue";
import CrudSearch from "./CrudSearch.vue";
import CrudTable from "./CrudTable.vue";
import CrudForm from "./CrudForm.vue";
import useCrudPage from "./useCrudPage";

const props = defineProps({
  searchConfig: {
    type: Object,
  },
  tableConfig: {
    type: Object,
    required: true,
  },
  formConfig: {
    type: Object,
  },
  /** 列表行缺少表单字段时，通过此函数加载完整详情 */
  loadFormData: {
    type: Function,
  },
});
const emit = defineEmits(["create", "saved", "toolbar-action", "row-action"]);
const slots = useSlots();
const resolvedFormConfig = computed(() =>
  props.formConfig
    ? { ...props.formConfig, rowKey: props.formConfig.rowKey ?? props.tableConfig.rowKey }
    : undefined
);
const page = useCrudPage();
const {
  searchRef,
  tableRef,
  formRef,
  search,
  resetSearch,
  refresh,
  openCreate,
  toggleSearch,
  applyFilters,
} = page;

// 子组件挂载后读取搜索初值，避免首次重复请求。
onMounted(() => search());

/**
 * 筛选子组件插槽，并去掉转发前缀。
 */
function getSlotNames(prefix) {
  return Object.keys(slots)
    .filter((name) => name.startsWith(prefix))
    .map((name) => name.slice(prefix.length));
}

/**
 * 有表单时直接新增，否则交给页面处理。
 */
function handleCreate() {
  if (props.formConfig) openCreate();
  else emit("create");
}

/**
 * 打开编辑表单，默认使用页面配置的详情加载器。
 */
function openEdit(row, loader = props.loadFormData, target) {
  return page.openEdit(row, loader, target);
}

/**
 * 打开只读表单，默认使用页面配置的详情加载器。
 */
function openView(row, loader = props.loadFormData, target) {
  return page.openView(row, loader, target);
}

/**
 * 处理内置编辑、查看，再通知页面行操作。
 */
async function handleRowAction(action) {
  if (props.formConfig) {
    if (action.key === "edit") await openEdit(action.row);
    else if (action.key === "view") await openView(action.row);
  }
  emit("row-action", action);
}

/**
 * 保存成功后通知页面，并沿用已应用的条件刷新列表。
 */
async function handleSaved() {
  emit("saved");
  await refresh();
}

defineExpose({ ...page, openEdit, openView });
</script>
