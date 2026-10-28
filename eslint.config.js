import eslint from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import configPrettier from "eslint-config-prettier";

// 自动导入的 API 与 Element Plus 函数：由 unplugin-auto-import 注入，无需显式导入
// 新增自动导入的函数时在此补一行
const autoImportGlobals = {
  ElMessage: "readonly",
  ElMessageBox: "readonly",
  ElNotification: "readonly",
  computed: "readonly",
  createApp: "readonly",
  createPinia: "readonly",
  defineComponent: "readonly",
  defineStore: "readonly",
  getCurrentScope: "readonly",
  h: "readonly",
  inject: "readonly",
  markRaw: "readonly",
  nextTick: "readonly",
  onActivated: "readonly",
  onBeforeMount: "readonly",
  onBeforeUnmount: "readonly",
  onClickOutside: "readonly",
  onDeactivated: "readonly",
  onMounted: "readonly",
  onScopeDispose: "readonly",
  onUnmounted: "readonly",
  provide: "readonly",
  reactive: "readonly",
  readonly: "readonly",
  ref: "readonly",
  resolveComponent: "readonly",
  shallowRef: "readonly",
  storeToRefs: "readonly",
  toRaw: "readonly",
  toRefs: "readonly",
  toValue: "readonly",
  triggerRef: "readonly",
  useClipboard: "readonly",
  useDateFormat: "readonly",
  useDebounceFn: "readonly",
  useElementHover: "readonly",
  useFullscreen: "readonly",
  useI18n: "readonly",
  useResizeObserver: "readonly",
  useRoute: "readonly",
  useRouter: "readonly",
  useSlots: "readonly",
  useStorage: "readonly",
  useTemplateRef: "readonly",
  useTransition: "readonly",
  useVModel: "readonly",
  useWindowSize: "readonly",
  watch: "readonly",
  watchEffect: "readonly",
};

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/*.min.*", ".eslintcache"],
  },

  eslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],

  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.es2022,
        ...autoImportGlobals,
      },
    },
    plugins: {
      vue: pluginVue,
    },
    rules: {
      // 基础规则
      "no-console": ["error", { allow: ["warn", "error", "debug"] }],
      "no-debugger": "error",

      // ES6+ 规则
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",

      // 最佳实践
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],

      // 基础规则不识别模板中的变量，.vue 由 vue/no-unused-vars 处理
      "no-unused-vars": "off",
      // src 内含模板表达式与自动导入的组件，未定义检查只放在根目录与 mock
      "no-undef": "off",
      "no-redeclare": "off",
    },
  },

  {
    files: ["src/**/*.{js,vue}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...autoImportGlobals,
        __APP_INFO__: "readonly",
      },
    },
  },

  {
    files: ["*.{js,mjs,cjs}", "mock/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...autoImportGlobals } },
    rules: { "no-console": "off", "no-undef": "error" },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      vue: pluginVue,
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/require-explicit-emits": "error",
      "vue/no-unused-vars": "error",
      "vue/no-mutating-props": "warn",
      "vue/valid-v-for": "warn",
      "vue/no-template-shadow": "warn",
      // 组件由 unplugin-vue-components 自动注册，ESLint 侧拿不到已注册组件清单
      "vue/no-undef-components": "off",
      "vue/return-in-computed-property": "error",
      "vue/block-order": [
        "error",
        {
          order: ["template", "script", "style"],
        },
      ],
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "never",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
    },
  },

  {
    rules: {
      ...configPrettier.rules,
      "arrow-body-style": "off",
      "prefer-arrow-callback": "off",
    },
  },
];
