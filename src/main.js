import { createApp } from "vue";
import App from "./App.vue";
import { setupDirective } from "@/directives";
import { setupI18n } from "@/lang";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";
import { registerElementIcons } from "@/utils/register-components";
import { setupPermissionGuard } from "@/router/guards/permission";
import { InstallCodeMirror } from "codemirror-editor-vue3";

// 暗黑主题样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

// 全局引入 animate.css
import "animate.css";

// 自动为某些默认事件（如 touchstart、wheel 等）添加 { passive: true },提升滚动性能并消除控制台的非被动事件监听警告
import "default-passive-events";

const app = createApp(App);

setupDirective(app);
setupRouter(app);
setupStore(app);
setupI18n(app);
registerElementIcons(app);
app.use(InstallCodeMirror);
setupPermissionGuard();

app.mount("#app");
