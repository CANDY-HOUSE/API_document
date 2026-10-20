// 首页按语言跳转：
// - 访问站点根地址时，跳到上次使用的语言；第一次访问则按浏览器语言选择
//   （中文浏览器留在中文首页，日文跳到 /ja/，其他语言跳到 /en/）
// - 每次浏览页面都会记住当前语言，手动切换语言后以用户的选择为准
// - 只影响根地址，直接打开某个具体页面时不跳转

export const BASE = "/API_document/";
export const STORAGE_KEY = "candyhouse-docs-locale";

/** 根据路径判断语言：/en/... -> en，/ja/... -> ja，其余为 zh */
export function localeFromPath(pathname: string, base = BASE) {
  const m = /^(en|ja)(\/|$)/.exec(pathname.slice(base.length));
  return m ? m[1] : "zh";
}

/** 内联到 <head> 的脚本，在页面渲染前执行，避免先显示中文再跳转 */
export const localeRedirectScript = `(function () {
  var base = ${JSON.stringify(BASE)}, key = ${JSON.stringify(STORAGE_KEY)};
  var path = location.pathname;
  var saved = null;
  try { saved = localStorage.getItem(key); } catch (e) {}

  if (path === base || path === base + "index.html") {
    var target = saved;
    if (!target) {
      var langs = navigator.languages || [navigator.language || ""];
      target = "en";
      for (var i = 0; i < langs.length; i++) {
        var l = String(langs[i]).toLowerCase();
        if (l.indexOf("zh") === 0) { target = "zh"; break; }
        if (l.indexOf("ja") === 0) { target = "ja"; break; }
        if (l.indexOf("en") === 0) { target = "en"; break; }
      }
    }
    if (target === "en" || target === "ja") {
      location.replace(base + target + "/" + location.search + location.hash);
      return;
    }
  }

  var m = /^(en|ja)(\\/|$)/.exec(path.slice(base.length));
  try { localStorage.setItem(key, m ? m[1] : "zh"); } catch (e) {}
})();`;
