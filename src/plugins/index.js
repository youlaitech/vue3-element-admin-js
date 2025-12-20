import { setupDirective } from "@/directives";
import { setupI18n } from "@/lang";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";
import { setupElIcons } from "./icons";
import { setupPermissionGuard } from "@/router/guards/permission";
import { InstallCodeMirror } from "codemirror-editor-vue3";

export default {
  install(app) {
    // 自定义指令(directive)
    setupDirective(app);
    // 路由(router)
    setupRouter(app);
    // 状态管理(store)
    setupStore(app);
    // 国际化
    setupI18n(app);
    // Element-plus图标
    setupElIcons(app);
    // 路由守卫
    setupPermissionGuard();
    // 注册 CodeMirror
    app.use(InstallCodeMirror);
  },
};