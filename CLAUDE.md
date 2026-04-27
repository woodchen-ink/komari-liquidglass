# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Komari Web UI 的「液态玻璃 (Liquid Glass)」主题，移植自 `nezha-dash-v1` 的视觉风格，保持 Komari 原有数据层 (RPC2 + Context) 不变。

## Development Commands

- `npm install` — 安装依赖
- `npm run dev` — 启动 Vite 开发服务器
- `npm run build` — TypeScript 类型检查 + Vite 生产构建（输出到 `dist/`）
- `npm run lint` — ESLint
- `npm run preview` — 预览生产构建

## Architecture

### 数据层（保留 Komari 原架构）
- `src/contexts/`：`PublicInfoContext`、`LiveDataContext`（实时数据）、`NodeListContext`（节点元信息）、`RPC2Context`（RPC 调用）
- `src/lib/api.ts`、`src/lib/rpc2.ts`：API / RPC 客户端
- `src/types/LiveData.tsx`：`LiveData`、`Record` 实时数据类型
- `src/contexts/NodeListContext.tsx`：`NodeBasicInfo` 节点元信息类型

### 视觉层（液态玻璃主题，源自 nezha-dash-v1）
- `src/global.css`：全局样式 + `.glass-panel` / `.liquid-glass` 类 + `pulse-glow` / `gradient-shift` 动画。暗色变体同时兼容 `.dark` 与 Radix Themes 的 `.dark-theme`
- `src/components/DynamicBackground.tsx`：动态背景层
  - 优先读取 `publicInfo.theme_settings.backgroundImageUrlDesktop / backgroundImageUrlMobile`
  - 未配置时回退到 `https://random-api.czl.net/pic/ecy` 随机图
  - 暗色叠加层增强前景对比度
- `src/pages/_layout.tsx`：在主布局中挂载 `DynamicBackground`，主容器透明，依赖 z-index 分层
- `src/components/Node.tsx`：参考 nezha 的 `ServerCard` 重写为 4 宫格布局（CPU / 内存 / 存储 / 网络速率 / 总传输 / 连接信息），外层使用 `liquid-glass`，离线节点带 `pulse-animation` 红色脉冲
- `src/components/NavBar.tsx`、`src/components/Footer.tsx`、`src/pages/Index.tsx`：使用 `glass-panel` / `liquid-glass`

### Provider 层级（src/main.tsx）
```
ErrorBoundary → BrowserRouter → ThemeContext → Radix <Theme> → RPC2Provider → PublicInfoProvider → 路由
```

### 关键数据字段映射（nezha → komari）
| Nezha 字段 | Komari 字段 |
|---|---|
| `cpu` | `live.cpu.usage` |
| `mem` / `mem_total` | `live.ram.used` / `basic.mem_total` |
| `stg` / `disk_total` | `live.disk.used` / `basic.disk_total` |
| `up` / `down` | `live.network.up` / `live.network.down` |
| `net_in/out_transfer` | `live.network.totalDown` / `totalUp` |
| `country_code` | `basic.region`（国家旗帜） |
| `tcp` / `udp` / `process` | `live.connections.tcp/udp` / `live.process` |
| `uptime` | `live.uptime` |
| `load_1/5/15` | `live.load.load1/5/15` |
| `platform` / `arch` | `basic.os` / `basic.arch` |

## 主题配置 (komari-theme.json)
保留 Komari 原有 6 项配置：`showIpTagsInCard`、`showServerListInDetails`、`backgroundImageUrlDesktop/Mobile`、`offlineServerPosition`、`customFooterHtml`、`mainContentWidth`。

## 构建产出
- `dist/`：静态资源
- 主题打包：`dist/` + 根目录的 `komari-theme.json` + `preview.png` → 压缩为 ZIP，在 Komari 后台主题管理上传

## 自动发布 (`.github/workflows/release.yaml`)
- 触发：推送到 `radix` 分支，或在 Actions 页面手动 `workflow_dispatch`
- 版本号：`YY.MM.DD`（同一天多次发布自动追加 `-2` / `-3` 序号），tag 为 `vYY.MM.DD[-N]`
- 流程：`npm ci` → `npm run build` → 注入版本到 `komari-theme.json` → 回写 commit 到 `radix` 分支（带 `[skip ci]`）→ 打包 `dist/ + komari-theme.json + preview.png` 为 `komari-liquidglass-vYY.MM.DD[-N].zip` → 创建正式 GitHub Release（`prerelease: false` + `make_latest: true`）+ artifact
- Release 说明：自动聚合上一个 tag 至 HEAD 之间的非合并提交作为 changelog
- 安装：在 Releases 页面下载该 zip，上传到 Komari 后台 → 主题管理

## 已知约定
- 禁止使用 `localStorage` 存认证态（保持 Komari 现有 cookie 机制）
- 暗色模式同时存在两套机制：Radix Themes 的 `.dark-theme` 由 `<Theme appearance>` 控制；`tw-animate-css` 的 `.dark` 自定义 variant 在 `global.css` 中定义。`global.css` 中的玻璃样式同时支持两者
- 主页背景：旧实现是 `_layout` 内联背景图 + `bg-accent-1` 兜底；新实现统一交给 `DynamicBackground`
