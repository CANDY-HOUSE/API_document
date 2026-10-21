import type MarkdownIt from "markdown-it";
import plantumlEncoder from "plantuml-encoder";

// ```plantuml 代码块在构建时转成 plantuml.com 渲染的 SVG 图片（与原 doc.candyhouse.co 相同的服务）。
// Markdown 里保留 PlantUML 源码，修改图只需改代码块。
const SERVER = "https://www.plantuml.com/plantuml/svg/";

export function plantumlPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim().split(/\s+/)[0] !== "plantuml") return fence(tokens, idx, options, env, self);
    const src = SERVER + plantumlEncoder.encode(token.content);
    return `<p class="plantuml"><img src="${md.utils.escapeHtml(src)}" alt="PlantUML diagram" loading="lazy"></p>\n`;
  };
}
