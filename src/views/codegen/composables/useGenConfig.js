import GeneratorAPI from "@/api/codegen";
import DictAPI from "@/api/system/dict";
import MenuAPI from "@/api/system/menu";
import { QueryTypeEnum } from "@/enums/codegen";

export function useGenConfig() {
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

  const menuOptions = ref([]);
  const dictOptions = ref([]);

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

  watch(
    () => genConfigFormData.value.fieldConfigs,
    (newVal) => {
      if (!newVal) return;
      newVal.forEach((fieldConfig) => {
        if (
          fieldConfig.fieldType?.includes("Date") &&
          fieldConfig.isShowInQuery === 1 &&
          fieldConfig.queryType == null
        ) {
          fieldConfig.queryType = QueryTypeEnum.BETWEEN.value;
        }
      });
    },
    { deep: true, immediate: true }
  );

  async function loadConfig(tableName) {
    const [menuList, dictList, config] = await Promise.all([
      MenuAPI.getOptions(true),
      DictAPI.getList(),
      GeneratorAPI.getGenConfig(tableName),
    ]);
    menuOptions.value = menuList;
    dictOptions.value = dictList;
    genConfigFormData.value = config;
    return config;
  }

  async function saveConfig(tableName) {
    await GeneratorAPI.saveGenConfig(tableName, genConfigFormData.value);
  }

  function validateBasic() {
    const { tableName, packageName, businessName, moduleName, entityName } =
      genConfigFormData.value;
    if (!tableName || !packageName || !businessName || !moduleName || !entityName) {
      ElMessage.error("表名、业务名、包名、模块名、实体名不能为空");
      return false;
    }
    return true;
  }

  function bulkSet(key, value) {
    const list = genConfigFormData.value?.fieldConfigs || [];
    list.forEach((row) => {
      row[key] = value;
    });
  }

  return {
    genConfigFormData,
    genConfigFormRules,
    menuOptions,
    dictOptions,
    loadConfig,
    saveConfig,
    validateBasic,
    bulkSet,
  };
}
