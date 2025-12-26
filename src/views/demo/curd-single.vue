<template>
  <div class="app-container h-full flex flex-1 flex-col">
    <div class="mb-10">
      <el-link
        href="https://gitee.com/youlaiorg/vue3-element-admin/blob/master/src/views/demo/curd-demo.vue"
        type="primary"
        target="_blank"
      >
        整合版示例源码 请点击 >>>
      </el-link>
    </div>

    <!-- 搜索 -->
    <page-search
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    />

    <!-- 列表 -->
    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick"
      @export-click="handleExportClick"
      @search-click="handleSearchClick"
      @toolbar-click="handleToolbarClick"
      @operate-click="handleOperateClick"
      @filter-change="handleFilterChange"
    >
      <template #status="scope">
        <el-tag :type="scope.row[scope.prop] == 1 ? 'success' : 'info'">
          {{ scope.row[scope.prop] == 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>
      <template #gender="scope">
        <DictTag v-model="scope.row[scope.prop]" code="gender" />
      </template>
      <template #mobile="scope">
        <el-text>{{ scope.row[scope.prop] }}</el-text>
        <copy-button
          v-if="scope.row[scope.prop]"
          :text="scope.row[scope.prop]"
          :style="{ marginLeft: '2px' }"
        />
      </template>
    </page-content>

    <!-- 新增 -->
    <page-modal ref="addModalRef" :modal-config="addModalConfig" @submit-click="handleSubmitClick">
      <template #gender="scope">
        <DictSelect v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
      </template>
    </page-modal>

    <!-- 编辑 -->
    <page-modal
      ref="editModalRef"
      :modal-config="editModalConfig"
      @submit-click="handleSubmitClick"
    >
      <template #gender="scope">
        <DictSelect v-model="scope.formData[scope.prop]" code="gender" v-bind="scope.attrs" />
      </template>
    </page-modal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserAPI from "@/api/system/user";
import DeptAPI from "@/api/system/dept";
import RoleAPI from "@/api/system/role";
import { useAppStore } from "@/store";
import usePage from "@/components/CURD/usePage";

defineOptions({
  name: "CurdDemo",
  inheritAttrs: false,
});

// 共享选项数据
const deptArr = ref([]);
const roleArr = ref([]);
const stateArr = ref([
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
]);

// 初始化选项数据
const loadOptions = async () => {
  try {
    const [deptRes, roleRes] = await Promise.all([DeptAPI.getList(), RoleAPI.getList()]);
    deptArr.value = deptRes.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    roleArr.value = roleRes.data.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error("加载选项数据失败:", error);
  }
};

loadOptions();

// 使用页面操作 Hook
const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleResetClick,
  handleAddClick,
  handleEditClick,
  handleSubmitClick,
  handleExportClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();

// 搜索配置
const searchConfig = ref({
  formItems: [
    { type: "input", label: "用户名", prop: "username", attrs: { placeholder: "请输入用户名" } },
    { type: "input", label: "昵称", prop: "nickname", attrs: { placeholder: "请输入昵称" } },
    { type: "select", label: "状态", prop: "status", options: stateArr },
    {
      type: "select",
      label: "性别",
      prop: "gender",
      options: [
        { label: "男", value: 1 },
        { label: "女", value: 2 },
      ],
    },
  ],
});

// 列表配置
const contentConfig = ref({
  indexAction: UserAPI.getPage,
  deleteAction: UserAPI.del,
  exportAction: UserAPI.export,
  cols: [
    { type: "selection", width: "55" },
    { label: "用户名", prop: "username", width: "120" },
    { label: "昵称", prop: "nickname", width: "120" },
    { label: "性别", prop: "gender", width: "80", templet: "custom" },
    { label: "手机号", prop: "mobile", width: "140", templet: "custom" },
    { label: "状态", prop: "status", width: "80", templet: "custom" },
    { label: "创建时间", prop: "createTime", width: "180" },
    {
      type: "default",
      label: "操作",
      width: "180",
      operat: [
        { name: "edit", text: "编辑" },
        { name: "delete", text: "删除" },
      ],
    },
  ],
});

// 新增模态框配置
const addModalConfig = ref({
  formItems: [
    {
      type: "input",
      label: "用户名",
      prop: "username",
      rules: [{ required: true, message: "请输入用户名" }],
    },
    {
      type: "input",
      label: "昵称",
      prop: "nickname",
      rules: [{ required: true, message: "请输入昵称" }],
    },
    { type: "custom", label: "性别", prop: "gender" },
    { type: "input", label: "手机号", prop: "mobile" },
    { type: "select", label: "状态", prop: "status", initialValue: 1, options: stateArr },
  ],
});

// 编辑模态框配置
const editModalConfig = ref({
  pk: "id",
  formItems: [
    {
      type: "input",
      label: "用户名",
      prop: "username",
      rules: [{ required: true, message: "请输入用户名" }],
    },
    {
      type: "input",
      label: "昵称",
      prop: "nickname",
      rules: [{ required: true, message: "请输入昵称" }],
    },
    { type: "custom", label: "性别", prop: "gender" },
    { type: "input", label: "手机号", prop: "mobile" },
    { type: "select", label: "状态", prop: "status", options: stateArr },
  ],
});

// 工具栏点击处理
const handleToolbarClick = (data) => {
  console.log("toolbar click:", data);
};

// 操作列点击处理
const handleOperateClick = (data) => {
  const { name, row } = data;
  if (name === "edit") {
    handleEditClick(row);
  }
};
</script>
