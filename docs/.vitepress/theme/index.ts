import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { localeFromPath, STORAGE_KEY } from "../locale.mts";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === "undefined") return;
    // 站内切换页面（含语言菜单切换）不会重新执行 <head> 脚本，这里同步记住当前语言
    const previous = router.onAfterRouteChange;
    router.onAfterRouteChange = (to) => {
      try {
        localStorage.setItem(STORAGE_KEY, localeFromPath(new URL(to, location.origin).pathname));
      } catch {}
      return previous?.(to);
    };
  },
} satisfies Theme;
