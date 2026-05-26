# AGENTS.md — Micro Measure Tool

> 通用开发规范 (文档/任务/Git/Session) 见 [dev-conventions](.agents/skills/dev-conventions/SKILL.md). **务必立即加载该技能**

## 项目

显微镜图像归集与测量 Web 应用. 前端 browser app, 依赖 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) 读写本地文件夹.

## 技术栈

- Vite + React + TypeScript (浏览器端, 无后端)
- Tailwind CSS v4, zustand, Konva.js (react-konva)
- Monorepo: 公共库放 `packages/@sailing3d/`, 本项目包放 `packages/@micro-measure-tool/`

## 开发命令

```bash
npm install            # 安装所有 workspace 依赖
npm run dev            # 启动 dev server (http://localhost:5173)
npm run dev:https      # 启动 HTTPS 代理 (https://0.0.0.0:5443) — 用于非 localhost 访问
npm run build          # typecheck + 构建
npm run deploy         # 构建 + 部署到 Cloudflare Pages
npm run deploy         # 构建 + 部署到 Cloudflare Pages
npm run lint           # ESLint
npm run typecheck      # TypeScript 类型检查
```
