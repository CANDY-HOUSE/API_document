import fs from "node:fs";
import path from "node:path";

// 侧边栏根据 docs/ 下的文件自动生成：蓝牙指令页面（数字开头）以文件名作为标题，
// 其余页面使用 frontmatter 的 title 或第一个一级标题。
const DOCS = path.resolve(__dirname, "..");
const API_DIR = "SesameOS3";

const SDK_PAGES = ["hello", "ios", "android", "esp"];
const CLOUD_PAGES = ["restful", "webapi", "webhook"];
const BLE_PAGES = ["bluetooth", "BLEcompatibility"];
const HIDDEN_PAGES: string[] = [];

const SECTION_LABELS = {
  zh: ["SesameSDK", "云端 API", "蓝牙", "指令", "其他", "SesameOS2（旧版）"],
  en: ["SesameSDK", "Cloud API", "Bluetooth", "Commands", "Others", "SesameOS2 (Legacy)"],
  ja: ["SesameSDK", "クラウド API", "Bluetooth", "コマンド", "その他", "SesameOS2（旧版）"],
};

// SesameOS2 旧文档（来自原 doc.candyhouse.co），只有日文；顺序沿用旧站点。
// 概述页有中文和日文两版，其余页面各语言都链接到日文版。
// Android / iOS 只作为分组标题（介绍与概述页相同，不再单独成页）。
const OS2_DIR = "SesameOS2";
const OS2_PAGES: (string | [string, string[]])[] = [
  "index",
  ["SesameSDK (Android版)", ["android/quick_start_android", "android/quick_start_wifi_module"]],
  ["SesameSDK (iOS版)", ["ios/quick_start_ios", "ios/quick_start_wifi_module"]],
  "flow_charts",
  "reference",
];

const isCommand = (stem: string) => /^\d+_/.test(stem);

// 只有中文版的页面，在英文 / 日文侧边栏里显示的名称
// 即将废弃的页面：侧边栏名称后加灰色标记（VitePress 自带的 info Badge 样式，不太醒目）
const DEPRECATED: Record<string, Record<"zh" | "en" | "ja", string>> = {
  restful: { zh: "即将废弃", en: "Deprecated", ja: "廃止予定" },
};

const LABEL_OVERRIDES: Record<string, { en: string; ja: string }> = {
  BLEcompatibility: { en: "Compatibility", ja: "互換性" },
};

// 蓝牙指令的显示名称：编号后的第一个下划线改为「. 」，并修正文件名里的拼写错误（文件名和网址不变）
const SPELLING: Record<string, string> = { registor: "register", megnet: "magnet", varify: "verify" };
export const commandLabel = (stem: string) =>
  stem
    .replace(/[A-Za-z]+/g, (w) => SPELLING[w] ?? w)
    .replace(/_([a-z])/, (_, c: string) => `. ${c.toUpperCase()}`);

function readTitle(file: string, stem: string) {
  if (isCommand(stem)) return commandLabel(stem);
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const meta = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
  const title = /^title:\s*(.+)$/m.exec(meta)?.[1] ?? /^#\s+(.+)$/m.exec(text)?.[1] ?? stem;
  return title.trim().replace(/^["']|["']$/g, "");
}

function listPages(prefix: string) {
  const dir = path.join(DOCS, prefix, API_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
}

function buildOS2Items(locale: "zh" | "en" | "ja") {
  const item = (page: string) => {
    const p = locale === "zh" && fs.existsSync(path.join(DOCS, OS2_DIR, `${page}.md`)) ? "" : "ja/";
    const link = `/${p}${OS2_DIR}/${page === "index" ? "" : page}`;
    return { text: readTitle(path.join(DOCS, p, OS2_DIR, `${page}.md`), page), link };
  };
  return OS2_PAGES.map((entry) =>
    typeof entry === "string" ? item(entry) : { text: entry[0], collapsed: false, items: entry[1].map(item) },
  );
}

export function buildSidebar(locale: "zh" | "en" | "ja") {
  const prefix = locale === "zh" ? "" : `${locale}/`;
  const localized = new Set(listPages(prefix));
  const stems = listPages("");

  // 缺少翻译的页面会链接到中文版，点击后语言会切换成中文；构建时提示，便于及时补齐
  const untranslated = stems.filter((s) => !localized.has(s));
  if (prefix && untranslated.length) {
    console.warn(`[sidebar] ${locale} 缺少翻译，将链接到中文版：${untranslated.join(", ")}`);
  }

  // 缺少翻译的页面链接到中文版
  const item = (stem: string) => {
    const p = localized.has(stem) ? prefix : "";
    const override = locale !== "zh" && !localized.has(stem) ? LABEL_OVERRIDES[stem]?.[locale] : undefined;
    const text = override ?? readTitle(path.join(DOCS, p, API_DIR, `${stem}.md`), stem);
    const badge = DEPRECATED[stem] ? ` <span class="VPBadge info">${DEPRECATED[stem][locale]}</span>` : "";
    return { text: text + badge, link: `/${p}${API_DIR}/${stem}` };
  };
  const pick = (names: string[]) => names.filter((n) => stems.includes(n)).map(item);

  const commands = stems.filter(isCommand).sort((a, b) => parseInt(a) - parseInt(b));
  const listed = new Set([...SDK_PAGES, ...CLOUD_PAGES, ...BLE_PAGES, ...commands, ...HIDDEN_PAGES]);
  const others = stems.filter((s) => !listed.has(s)).sort();
  const labels = SECTION_LABELS[locale];

  return [
    { text: labels[0], items: pick(SDK_PAGES) },
    { text: labels[1], items: pick(CLOUD_PAGES) },
    // 蓝牙指令作为「蓝牙」分组下的可折叠子分组
    { text: labels[2], items: [...pick(BLE_PAGES), { text: labels[3], collapsed: false, items: commands.map(item) }] },
    ...(others.length ? [{ text: labels[4], items: others.map(item) }] : []),
    { text: labels[5], collapsed: true, items: buildOS2Items(locale) },
  ];
}
