import { defaults } from "@/settings";
import { SidebarColor, ThemeMode, LayoutMode } from "@/enums/settings";
import { generateThemeColors, applyTheme, toggleDarkMode, toggleSidebarColor } from "@/utils/theme";

export const useSettingsStore = defineStore("setting", () => {
  // 基本设置
  const settingsVisible = ref(false);
  // 标签视图
  const tagsView = useStorage("tagsView", defaults.tagsView);
  // 侧边栏 Logo
  const sidebarLogo = useStorage("sidebarLogo", defaults.sidebarLogo);
  // 侧边栏配色方案 (经典蓝/极简白)
  const sidebarColorScheme = useStorage("sidebarColorScheme", defaults.sidebarColorScheme);
  // 布局
  const layout = useStorage("layout", defaults.layout);
  // 水印
  const watermarkEnabled = useStorage("watermarkEnabled", defaults.watermarkEnabled);

  // 主题
  const themeColor = useStorage("themeColor", defaults.themeColor);
  const theme = useStorage("theme", defaults.theme);

  //  监听主题变化
  watch(
    [theme, themeColor],
    ([newTheme, newThemeColor]) => {
      toggleDarkMode(newTheme === ThemeMode.DARK);
      const colors = generateThemeColors(newThemeColor, newTheme);
      applyTheme(colors);
    },
    { immediate: true }
  );

  //  监听浅色侧边栏配色方案变化
  watch(
    [sidebarColorScheme],
    ([newSidebarColorScheme]) => {
      toggleSidebarColor(newSidebarColorScheme === SidebarColor.CLASSIC_BLUE);
    },
    { immediate: true }
  );

  // 设置映射
  const settingsMap = {
    tagsView,
    sidebarLogo,
    sidebarColorScheme,
    layout,
    watermarkEnabled,
  };

  function changeSetting({ key, value }) {
    const setting = settingsMap[key];
    if (setting) setting.value = value;
  }

  function changeTheme(val) {
    theme.value = val;
  }

  function changeSidebarColor(val) {
    sidebarColorScheme.value = val;
  }

  function changeThemeColor(color) {
    themeColor.value = color;
  }

  function changeLayout(val) {
    layout.value = val;
  }

  return {
    settingsVisible,
    tagsView,
    sidebarLogo,
    sidebarColorScheme,
    layout,
    themeColor,
    theme,
    watermarkEnabled,
    changeSetting,
    changeTheme,
    changeThemeColor,
    changeLayout,
    changeSidebarColor,
  };
});
