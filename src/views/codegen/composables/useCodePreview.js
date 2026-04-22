import GeneratorAPI from "@/api/codegen";
import {
  buildFileTree,
  filterTree,
  findFirstLeaf,
  findLeafByKey,
  getFileIcon,
} from "../utils/tree-builder";

export function useCodePreview(genConfigFormData) {
  const treeData = ref([]);
  const previewScope = ref("all");
  const previewTypeOptions = ref([]);
  const previewTypes = ref([]);

  const filteredTreeData = computed(() => {
    if (!treeData.value.length) return [];
    return filterTree(treeData.value, previewScope.value, previewTypes.value);
  });

  const code = ref("");
  const currentFileKey = ref("");
  const fileTreeRef = ref();

  const { copy, copied } = useClipboard();

  watch(copied, () => {
    if (copied.value) ElMessage.success("复制成功");
  });

  async function handlePreview(tableName) {
    treeData.value = [];
    const pageType = genConfigFormData.value.pageType || "classic";
    const data = await GeneratorAPI.getPreviewData(tableName, pageType, "js");
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

    const tree = buildFileTree(previewList);
    treeData.value = tree?.children ? [...tree.children] : [];

    const firstLeaf = findFirstLeaf(tree);
    if (firstLeaf) {
      code.value = firstLeaf.content || "";
      currentFileKey.value = firstLeaf.key || "";
      await nextTick();
      fileTreeRef.value?.setCurrentKey?.(currentFileKey.value);
    }

    return previewList;
  }

  function handleFileTreeNodeClick(data) {
    if (!data.children || data.children.length === 0) {
      code.value = data.content || "";
      currentFileKey.value = data.key || "";
    }
  }

  function handleCopyCode() {
    if (code.value) copy(code.value);
  }

  watch(
    () => filteredTreeData.value,
    async (nodes) => {
      if (!nodes.length) {
        currentFileKey.value = "";
        code.value = "";
        return;
      }
      if (currentFileKey.value) {
        const leaf = findLeafByKey(nodes, currentFileKey.value);
        if (leaf) {
          await nextTick();
          fileTreeRef.value?.setCurrentKey?.(currentFileKey.value);
          return;
        }
      }
      const first = findFirstLeaf({ label: "root", key: "root", children: nodes });
      if (first) {
        code.value = first.content || "";
        currentFileKey.value = first.key || "";
        await nextTick();
        fileTreeRef.value?.setCurrentKey?.(currentFileKey.value);
      }
    },
    { immediate: true }
  );

  return {
    treeData,
    filteredTreeData,
    previewScope,
    previewTypes,
    previewTypeOptions,
    code,
    currentFileKey,
    fileTreeRef,
    handlePreview,
    handleFileTreeNodeClick,
    handleCopyCode,
    getFileIcon,
  };
}
