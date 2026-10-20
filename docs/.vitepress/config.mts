import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { buildSidebar } from "./sidebar.mts";
import { BASE, localeRedirectScript } from "./locale.mts";

export default withMermaid(
  defineConfig({
    base: BASE,
    title: "CANDY HOUSE API Document",
    cleanUrls: true,
    head: [["script", {}, localeRedirectScript]],
    // mermaid 依赖的 fastdom 等是 CommonJS 包，开发模式下需要整体预构建
    vite: { optimizeDeps: { include: ["mermaid"] } },
    themeConfig: {
      socialLinks: [{ icon: "github", link: "https://github.com/CANDY-HOUSE/API_document" }],
      outline: { level: [2, 3] },
      search: {
        provider: "local",
        options: {
          locales: {
            root: { translations: { button: { buttonText: "搜索" }, modal: { noResultsText: "没有找到结果" } } },
            ja: { translations: { button: { buttonText: "検索" }, modal: { noResultsText: "結果が見つかりません" } } },
          },
        },
      },
    },
    locales: {
      root: {
        label: "中文",
        lang: "zh-CN",
        themeConfig: {
          sidebar: buildSidebar("zh"),
          outline: { level: [2, 3], label: "本页目录" },
          docFooter: { prev: "上一页", next: "下一页" },
          langMenuLabel: "语言",
          returnToTopLabel: "回到顶部",
          sidebarMenuLabel: "菜单",
          darkModeSwitchLabel: "深色模式",
        },
      },
      en: {
        label: "English",
        lang: "en-US",
        link: "/en/",
        themeConfig: { sidebar: buildSidebar("en") },
      },
      ja: {
        label: "日本語",
        lang: "ja-JP",
        link: "/ja/",
        themeConfig: {
          sidebar: buildSidebar("ja"),
          outline: { level: [2, 3], label: "目次" },
          docFooter: { prev: "前へ", next: "次へ" },
          langMenuLabel: "言語",
          returnToTopLabel: "トップへ戻る",
          sidebarMenuLabel: "メニュー",
          darkModeSwitchLabel: "ダークモード",
        },
      },
    },
  }),
);
