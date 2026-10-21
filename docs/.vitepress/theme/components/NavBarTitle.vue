<script setup lang="ts">
// 替换 VitePress 默认的 VPNavBarTitle（通过 config.mts 里的 alias）：
// 默认实现把 Logo 和站点名称放在同一个链接里；这里拆成两个链接——
// 点击 Logo 在新标签打开 CANDY HOUSE 官网（themeConfig.logoLink），
// 点击文字回到当前语言的文档首页（SesameSDK 概览）。
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { useSidebar } from "vitepress/theme";
import { HOME_PAGE } from "../../locale.mts";

const { site, theme, localeIndex } = useData();
const { hasSidebar } = useSidebar();

const logoSrc = computed(() => {
  const logo = theme.value.logo;
  const src = typeof logo === "string" ? logo : logo?.src;
  return src ? withBase(src) : undefined;
});
const logoAlt = computed(() => (typeof theme.value.logo === "object" ? theme.value.logo?.alt : undefined) ?? "");

const logoLink = computed(() => {
  const l = theme.value.logoLink;
  return typeof l === "string" ? { link: l } : (l ?? {});
});

const homeLink = computed(() => {
  const prefix = localeIndex.value === "root" ? "" : `${localeIndex.value}/`;
  return withBase(`/${prefix}${HOME_PAGE}`);
});

const title = computed(() => (theme.value.siteTitle === undefined ? site.value.title : theme.value.siteTitle));
</script>

<template>
  <div class="VPNavBarTitle" :class="{ 'has-sidebar': hasSidebar }">
    <div class="title">
      <a
        v-if="logoSrc"
        class="logo-link"
        :href="logoLink.link ?? homeLink"
        :target="logoLink.target"
        :rel="logoLink.rel"
        :aria-label="logoAlt"
      >
        <img class="logo" :src="logoSrc" :alt="logoAlt" />
      </a>
      <a v-if="title" class="site-title" :href="homeLink" v-html="title"></a>
    </div>
  </div>
</template>

<style scoped>
/* 与 VitePress 默认 VPNavBarTitle 的样式保持一致 */
.title {
  display: flex;
  align-items: center;
  border-bottom: 1px solid transparent;
  width: 100%;
  height: var(--vp-nav-height);
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: opacity 0.25s;
}

@media (min-width: 960px) {
  .title {
    flex-shrink: 0;
  }

  .VPNavBarTitle.has-sidebar .title {
    border-bottom-color: var(--vp-c-divider);
  }
}

.logo-link,
.site-title {
  display: flex;
  align-items: center;
  height: 100%;
  color: inherit;
}

.logo {
  margin-right: 8px;
  height: var(--vp-nav-logo-height);
}
</style>
