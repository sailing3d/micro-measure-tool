---
title: 技术栈总结 — Micro Measure Tool
created: 2026-05-26
date: 2026-05-26
summary: 列出项目使用的全部框架、库、工具及其职责.
related:
  - doc-architecture
  - doc-requirements
---

# 技术栈总结

## 构建与开发

| 工具 | 版本 | 用途 |
|------|------|------|
| [Vite](https://vitejs.dev) | ^5.4 | 开发服务器, 构建打包 (ESM 原生支持) |
| [TypeScript](https://www.typescriptlang.org) | ~5.8 | 类型系统, 编译检查 |
| [ESLint](https://eslint.org) | ^9.33 | 代码规范 (flat config) |

## UI 框架

| 框架 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev) | ^19.1 | UI 组件框架 |
| [react-dom](https://react.dev) | ^19.1 | React DOM 渲染器 |

## 样式

| 库 | 版本 | 用途 |
|------|------|------|
| [Tailwind CSS](https://tailwindcss.com) | ^4.1 | 原子化 CSS, 通过 `@tailwindcss/vite` 插件集成 |

## 状态管理

| 库 | 版本 | 用途 |
|------|------|------|
| [zustand](https://zustand-demo.pmnd.rs) | ^5.0 | 轻量状态管理, `persist` middleware 实现 sessionStorage 持久化 |

## 画布渲染

| 库 | 版本 | 用途 |
|------|------|------|
| [Konva.js](https://konvajs.org) | ^9.3 | 2D Canvas 渲染引擎 |
| [react-konva](https://konvajs.org/docs/react) | ^19.0 | Konva 的 React 绑定, 声明式画布组件 |

## 浏览器 API

| API | 用途 |
|------|------|
| [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) | 读写本地文件夹 (项目创建, 图片复制, JSON 保存) |
| `Window.showDirectoryPicker` | 选择/创建项目目录 |
| `FileSystemDirectoryHandle` | 文件夹内文件的增删读写 |
| `FileSystemFileHandle.createWritable` | 写入文件 |
| `Window.showSaveFilePicker` | 导出文件选择保存位置 |

## 架构概览

组件树, 6 个 Store, 测量工具插件体系详见 [架构设计](doc-architecture.md).

## 数据持久化

| 机制 | 用途 |
|------|------|
| `project.json` | 项目文件夹内, 存储格子配置, 标定值, 图片列表, 测量数据 |
| `IndexedDB` | `dbService.ts`, 持久化 `FileSystemDirectoryHandle`, 刷新后自动恢复项目 |
| `sessionStorage` | zustand `persist` middleware, 6 个 Store 刷新恢复 |
| `localStorage` | 全局项目索引 (recent projects)

## 坐标系约定

- `offsetX/offsetY`: 图片左上角相对于格子左上角的偏移
- `imgGroup.x/y`: 图片中心在格子坐标系中的位置
- `Stage x/y`: 画布平移偏移
- `Stage scale`: 画布缩放
- `imgW = naturalWidth * displayZoom`: 图片渲染尺寸
- 详见 `docs/doc-coordinate-system.md`

### 开发环境

详见 [README](../README.md).
