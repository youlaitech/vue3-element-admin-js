<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-section">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="原始命令/函数名称/用户名"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="aiProvider" label="AI提供方">
          <el-select
            v-model="queryParams.aiProvider"
            placeholder="请选择"
            clearable
            style="width: 140px"
          >
            <el-option label="通义千问" value="qwen" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Gemini" value="gemini" />
          </el-select>
        </el-form-item>

        <el-form-item prop="aiModel" label="AI模型">
          <el-input
            v-model="queryParams.aiModel"
            placeholder="如: qwen-plus"
            clearable
            style="width: 160px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item prop="parseStatus" label="解析状态">
          <el-select
            v-model="queryParams.parseStatus"
            placeholder="请选择"
            clearable
            style="width: 140px"
          >
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item prop="executeStatus" label="执行状态">
          <el-select
            v-model="queryParams.executeStatus"
            placeholder="请选择"
            clearable
            style="width: 140px"
          >
            <el-option label="待执行" :value="0" />
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="-1" />
          </el-select>
        </el-form-item>

        <el-form-item prop="createTime" label="创建时间">
          <el-date-picker
            v-model="queryParams.createTime"
            :editable="false"
            type="daterange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="截止时间"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="hover" class="table-section">
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="table-section__content"
      >
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="用户名" prop="username" width="120" />
        <el-table-column
          label="原始命令"
          prop="originalCommand"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column label="解析状态" prop="parseStatus" width="100">
          <template #default="{ row }">
            <el-tag :type="row.parseStatus === 1 ? 'success' : 'danger'">
              {{ row.parseStatus === 1 ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="执行状态" prop="executeStatus" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.executeStatus === 1
                  ? 'success'
                  : row.executeStatus === -1
                    ? 'danger'
                    : 'warning'
              "
            >
              {{ row.executeStatus === 1 ? "成功" : row.executeStatus === -1 ? "失败" : "待执行" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AI提供方" prop="aiProvider" width="120" />
        <el-table-column label="AI模型" prop="aiModel" width="120" />

        <el-table-column fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import AiCommandApi from "@/api/ai";

// 状态管理
const loading = ref(false);
const total = ref(0);
const pageData = ref([]);
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
  aiProvider: "",
  aiModel: "",
  parseStatus: undefined,
  executeStatus: undefined,
  createTime: [],
});

const queryFormRef = ref();

// 获取数据
const getList = async () => {
  loading.value = true;
  try {
    const response = await AiCommandApi.getPage(queryParams.value);
    pageData.value = response.data || [];
    total.value = response.page?.total ?? 0;
  } catch (error) {
    console.error("获取AI命令记录失败:", error);
    ElMessage.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  getList();
};

// 分页大小变化
const handleSizeChange = (size) => {
  queryParams.value.pageSize = size;
  queryParams.value.pageNum = 1;
  getList();
};

// 分页页码变化
const handleCurrentChange = (page) => {
  queryParams.value.pageNum = page;
  getList();
};

// 删除记录
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定删除这条记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await AiCommandApi.deleteByIds(row.id);
    ElMessage.success("删除成功");
    getList();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
    }
  }
};

// 组件挂载
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.app-container {
  .filter-section {
    margin-bottom: 20px;
  }

  .table-section {
    &__content {
      margin-bottom: 20px;
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .search-buttons {
    margin-left: 20px;
  }
}
</style>
