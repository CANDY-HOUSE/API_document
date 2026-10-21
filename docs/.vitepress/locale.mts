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

/** 各语言首页都直接打开 SesameSDK 概览 */
export const HOME_PAGE = "SesameOS3/hello";

/** 是否为某个语言的首页（/、/en/、/ja/，含 index.html） */
export function localeRootOf(pathname: string, base = BASE) {
  const m = /^(?:(en|ja)\/?)?(?:index(?:\.html)?)?$/.exec(pathname.slice(base.length));
  return m ? (m[1] ?? "") : null;
}

/** 内联到 <head> 的脚本，在页面渲染前执行：
 *  - 访问各语言首页时直接跳到该语言的 SesameSDK 概览
 *  - 访问站点根地址时，先按上次使用的语言 / 浏览器语言选择语言 */
export const localeRedirectScript = `(function () {
  var base = ${JSON.stringify(BASE)}, key = ${JSON.stringify(STORAGE_KEY)}, home = ${JSON.stringify(HOME_PAGE)};
  var path = location.pathname;
  var root = /^(?:(en|ja)\\/?)?(?:index(?:\\.html)?)?$/.exec(path.slice(base.length));
  if (root) {
    var target = root[1];
    if (!target) {
      try { target = localStorage.getItem(key); } catch (e) {}
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
    }
    location.replace(base + (target === "en" || target === "ja" ? target + "/" : "") + home + location.search + location.hash);
    return;
  }

  var m = /^(en|ja)(\\/|$)/.exec(path.slice(base.length));
  try { localStorage.setItem(key, m ? m[1] : "zh"); } catch (e) {}
})();`;
