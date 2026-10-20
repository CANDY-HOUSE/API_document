# CANDY HOUSE API Document

SesameSDK / SesameOS3 的 API 文档（中文 / English / 日本語）。

**在线阅读 / Online / オンライン：<https://candy-house.github.io/API_document/>**

| | 中文 | English | 日本語 |
| --- | --- | --- | --- |
| 概述 Overview | [docs/index.md](./docs/index.md) | [docs/en/index.md](./docs/en/index.md) | [docs/ja/index.md](./docs/ja/index.md) |
| API 目录 API Index | [docs/SesameOS3/index.md](./docs/SesameOS3/index.md) | [docs/en/SesameOS3/index.md](./docs/en/SesameOS3/index.md) | [docs/ja/SesameOS3/index.md](./docs/ja/SesameOS3/index.md) |
| Webhook | [webhook.md](./docs/SesameOS3/webhook.md) | [webhook.md](./docs/en/SesameOS3/webhook.md) | [webhook.md](./docs/ja/SesameOS3/webhook.md) |

## 目录结构

```
docs/
├── index.md              # 中文首页
├── SesameOS3/*.md        # 中文文档
├── en/                   # 英文（结构与中文相同）
├── ja/                   # 日文（结构与中文相同）
└── .vitepress/           # 站点配置（侧边栏按文件名自动生成）
```

- 新增文档：在对应语言目录下按「编号_名称.md」新建文件即可，侧边栏会自动出现；蓝牙指令页面以文件名作为标题。
- 缺少英文 / 日文翻译的页面，侧边栏会链接到中文版。

## 本地预览

```bash
npm install
npm run docs:dev
```

推送到 `master` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。
