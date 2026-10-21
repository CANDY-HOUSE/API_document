import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { BASE, HOME_PAGE, localeFromPath, localeRootOf, STORAGE_KEY } from "../locale.mts";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === "undefined") return;
    // 站内切换页面（含语言菜单切换）不会重新执行 <head> 脚本，这里同步记住当前语言
    const previous = router.onAfterRouteChange;
    router.onAfterRouteChange = (to) => {
      // 站内跳到语言首页（如 404 页的「回到首页」）时，同样转到 SesameSDK 概览
      const root = localeRootOf(new URL(to, location.origin).pathname);
      if (root !== null) {
        router.go(`${BASE}${root ? `${root}/` : ""}${HOME_PAGE}`);
        return previous?.(to);
      }
      try {
        localStorage.setItem(STORAGE_KEY, localeFromPath(new URL(to, location.origin).pathname));
      } catch {}
      return previous?.(to);
    };
  },
} satisfies Theme;
