import fs from "node:fs";
import path from "node:path";

// 侧边栏根据 docs/ 下的文件自动生成：蓝牙指令页面（数字开头）以文件名作为标题，
// 其余页面使用 frontmatter 的 title 或第一个一级标题。
const DOCS = path.resolve(__dirname, "..");
const API_DIR = "SesameOS3";

const SDK_PAGES = ["hello", "ios", "android", "esp"];
const CLOUD_PAGES = ["restful", "webapi", "webhook"];
const BLE_PAGES = ["bluetooth", "BLEcompatibility"];
const HIDDEN_PAGES = ["index", "devices_manual"];

const SECTION_LABELS = {
  zh: ["SDK", "云端 API", "蓝牙", "蓝牙指令", "其他"],
  en: ["SDK", "Cloud API", "Bluetooth", "Bluetooth Commands", "Others"],
  ja: ["SDK", "クラウド API", "Bluetooth", "Bluetooth コマンド", "その他"],
};

const isCommand = (stem: string) => /^\d+_/.test(stem);

function readTitle(file: string, stem: string) {
  if (isCommand(stem)) return stem;
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

export function buildSidebar(locale: "zh" | "en" | "ja") {
  const prefix = locale === "zh" ? "" : `${locale}/`;
  const localized = new Set(listPages(prefix));
  const stems = listPages("");

  // 缺少翻译的页面链接到中文版
  const item = (stem: string) => {
    const p = localized.has(stem) ? prefix : "";
    return { text: readTitle(path.join(DOCS, p, API_DIR, `${stem}.md`), stem), link: `/${p}${API_DIR}/${stem}` };
  };
  const pick = (names: string[]) => names.filter((n) => stems.includes(n)).map(item);

  const commands = stems.filter(isCommand).sort((a, b) => parseInt(a) - parseInt(b));
  const listed = new Set([...SDK_PAGES, ...CLOUD_PAGES, ...BLE_PAGES, ...commands, ...HIDDEN_PAGES]);
  const others = stems.filter((s) => !listed.has(s)).sort();
  const labels = SECTION_LABELS[locale];

  return [
    { text: labels[0], items: pick(SDK_PAGES) },
    { text: labels[1], items: pick(CLOUD_PAGES) },
    { text: labels[2], items: pick(BLE_PAGES) },
    { text: labels[3], collapsed: false, items: commands.map(item) },
    ...(others.length ? [{ text: labels[4], items: others.map(item) }] : []),
  ];
}
