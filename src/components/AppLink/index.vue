<template>
  <component :is="linkType" v-bind="linkProps(to)" @click="handleClick">
    <slot />
  </component>
</template>

<script setup>
import { isExternal } from "@/utils/index";
defineOptions({
  name: "AppLink",
  inheritAttrs: false,
});
/**
 * 应用内链接：按菜单路径跳转
 */
const props = defineProps({
  to: {
    type: Object,
    required: true,
  },
});
const externalUrl = computed(() => {
  return isExternal(props.to.path || "") ? props.to.path : "";
});
const isExternalLink = computed(() => {
  return Boolean(externalUrl.value);
});
const linkType = computed(() => (isExternalLink.value ? "a" : "router-link"));
/**
 * 拼接链接属性：外链给 a 标签，内链交给 router-link
 */
const linkProps = (to) => {
  if (isExternalLink.value) {
    return {
      href: externalUrl.value,
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }
  const { meta, ...routeTo } = to;
  void meta;
  return { to: routeTo };
};
/**
 * 外链点击自行处理跳转，不走 router-link 的默认行为
 */
function handleClick(event) {
  if (!isExternalLink.value) return;
  event.preventDefault();
  event.stopPropagation();
  window.open(externalUrl.value, "_blank", "noopener,noreferrer");
}
</script>
