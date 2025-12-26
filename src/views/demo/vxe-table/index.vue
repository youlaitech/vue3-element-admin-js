<template>
  <div class="app-container">
    <!-- 表格 -->
    <vxe-grid ref="xGrid" v-bind="gridOptions" v-on="gridEvents">
      <!-- 左侧按钮列表 -->
      <template #toolbar-btns>
        <vxe-button status="primary" icon="vxe-icon-add" @click="onShowModal">新增用户</vxe-button>
        <vxe-button status="danger" icon="vxe-icon-delete" @click="onDelete">批量删除</vxe-button>
      </template>

      <!-- 展开行 -->
      <template #column-expand="{ row }">
        <div style="padding: 20px">
          <ul>
            <li>
              <span>ID：</span>
              <span>{{ row.id }}</span>
            </li>
            <li>
              <span>用户名：</span>
              <span>{{ row.username }}</span>
            </li>
            <li>
              <span>创建时间：</span>
              <span>{{ row.createTime }}</span>
            </li>
          </ul>
        </div>
      </template>

      <!-- 操作列 -->
      <template #column-action="{ row }">
        <vxe-button type="text" status="primary" icon="vxe-icon-edit" @click="onEdit(row)">
          编辑
        </vxe-button>
        <vxe-button type="text" status="danger" icon="vxe-icon-delete" @click="onDeleteRow(row)">
          删除
        </vxe-button>
      </template>
    </vxe-grid>

    <!-- 新增/编辑对话框 -->
    <vxe-modal
      v-model="modalVisible"
      :title="modalTitle"
      width="600"
      :loading="modalLoading"
      @confirm="onSave"
    >
      <vxe-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        :items="formItems"
        title-width="100"
      />
    </vxe-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { VXETable } from "vxe-table";

// 表格引用
const xGrid = ref();

// 模态框状态
const modalVisible = ref(false);
const modalTitle = ref("新增用户");
const modalLoading = ref(false);

// 表单数据
const formData = reactive({
  username: "",
  nickname: "",
  mobile: "",
  status: 1,
});

// 表单规则
const formRules = {
  username: [{ required: true, message: "请输入用户名" }],
  nickname: [{ required: true, message: "请输入昵称" }],
};

// 表单项配置
const formItems = [
  { field: "username", title: "用户名", span: 24, itemProps: { required: true } },
  { field: "nickname", title: "昵称", span: 24, itemProps: { required: true } },
  { field: "mobile", title: "手机号", span: 24 },
  { field: "status", title: "状态", span: 24 },
];

// 表格配置
const gridOptions = reactive({
  border: true,
  resizable: true,
  showOverflow: true,
  showHeaderOverflow: true,
  showFooterOverflow: true,
  height: 400,
  loading: false,
  rowConfig: {
    keyField: "id",
    isHover: true,
  },
  columnConfig: {
    resizable: true,
  },
  columns: [
    { type: "checkbox", width: 60 },
    { type: "seq", width: 60 },
    { field: "username", title: "用户名", width: 120 },
    { field: "nickname", title: "昵称", width: 120 },
    { field: "mobile", title: "手机号", width: 140 },
    { field: "status", title: "状态", width: 80 },
    { field: "createTime", title: "创建时间", width: 160 },
    { title: "操作", width: 120, slots: { default: "column-action" } },
  ],
  data: [],
  toolbarConfig: {
    slots: {
      buttons: "toolbar-btns",
    },
  },
  expandConfig: {
    trigger: "row",
    showIcon: true,
  },
});

// 表格事件
const gridEvents = {
  checkboxChange: ({ records }) => {
    console.log("选中行:", records);
  },
  checkboxAll: ({ records }) => {
    console.log("全选:", records);
  },
};

// 显示新增模态框
const onShowModal = (row) => {
  modalVisible.value = true;
  modalTitle.value = row ? "编辑用户" : "新增用户";

  if (row) {
    Object.assign(formData, row);
  } else {
    Object.assign(formData, {
      username: "",
      nickname: "",
      mobile: "",
      status: 1,
    });
  }
};

// 编辑
const onEdit = (row) => {
  onShowModal(row);
};

// 删除单行
const onDeleteRow = (row) => {
  VXETable.modal.confirm(`确定要删除用户"${row.username}"吗？`).then(() => {
    // 删除逻辑
    console.log("删除用户:", row);
  });
};

// 批量删除
const onDelete = () => {
  const selectRecords = xGrid.value.getCheckboxRecords();
  if (selectRecords.length === 0) {
    VXETable.modal.message({ content: "请至少选择一条数据", status: "warning" });
    return;
  }

  VXETable.modal.confirm("确定要删除选中的数据吗？").then(() => {
    // 批量删除逻辑
    console.log("批量删除:", selectRecords);
  });
};

// 保存
const onSave = () => {
  modalLoading.value = true;

  // 模拟保存
  setTimeout(() => {
    modalLoading.value = false;
    modalVisible.value = false;
    VXETable.modal.message({ content: "保存成功", status: "success" });

    // 刷新表格数据
    loadData();
  }, 1000);
};

// 加载数据
const loadData = () => {
  gridOptions.loading = true;

  // 模拟加载数据
  setTimeout(() => {
    gridOptions.data = [
      {
        id: 1,
        username: "admin",
        nickname: "管理员",
        mobile: "13800138000",
        status: 1,
        createTime: "2023-01-01 12:00:00",
      },
      {
        id: 2,
        username: "user",
        nickname: "用户",
        mobile: "13800138001",
        status: 1,
        createTime: "2023-01-02 12:00:00",
      },
    ];
    gridOptions.loading = false;
  }, 500);
};

// 初始化
loadData();
</script>
