import { getCurrentScope, onScopeDispose, reactive, ref, shallowRef } from "vue";
import { cloneDeep } from "lodash-es";

/**
 * 分页查询只接收最近一次请求的结果；勾选与弹窗状态由页面持有。
 */
export function usePageTable(options) {
  const { request, onBeforeReset } = options;
  const initialParams = cloneDeep(options.initialParams);
  const params = reactive(cloneDeep(initialParams));
  const loading = ref(false);
  const list = shallowRef([]);
  const total = ref(0);
  let requestSequence = 0;

  /**
   * 按当前条件查询；结果和 loading 只由最近一次请求更新。
   */
  async function fetchData() {
    const sequence = ++requestSequence;
    // 请求使用独立快照，等待期间修改表单不会改变本次参数。
    const snapshot = cloneDeep(params);
    loading.value = true;
    try {
      const data = await request(snapshot);
      if (sequence !== requestSequence) return;
      list.value = data.list ?? [];
      total.value = data.total ?? 0;
    } finally {
      // 旧请求结束时，不能提前关闭新请求的 loading。
      if (sequence === requestSequence) loading.value = false;
    }
  }

  /**
   * 按当前条件查询第一页。
   */
  function handleQuery() {
    params.pageNum = 1;
    return fetchData();
  }

  /**
   * 保持响应式引用，删除新增条件，并从独立初值恢复。
   */
  function resetParams() {
    requestSequence += 1;
    loading.value = false;
    Object.keys(params).forEach((key) => Reflect.deleteProperty(params, key));
    Object.assign(params, cloneDeep(initialParams));
  }

  /**
   * 重置查询条件并加载第一页。
   */
  function handleResetQuery() {
    onBeforeReset?.();
    resetParams();
    return fetchData();
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      requestSequence += 1;
    });
  }

  return { loading, list, total, params, fetchData, handleQuery, handleResetQuery, resetParams };
}
