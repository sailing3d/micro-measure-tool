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

## 设计模式与架构

### 组件架构

```
App
├── StartupDialog          (启动: 新建/打开项目)
├── Layout
│   ├── Toolbar
│   │   ├── ProjectControls (项目名, 保存, 导出, 关闭)
│   │   ├── GridControls   (行列数, 格子大小)
│   │   ├── CalibrationControls (µm/px, Zoom, 画线标定)
│   │   └── ToolSelector   (测量工具切换)
│   ├── CanvasArea
│   │   └── Konva Stage
│   │       ├── GridLayer     (格子边框)
│   │       ├── ImageLayer    (图片 + 已完成测量图形)
│   │       ├── GridLabelsLayer (文件名标签, 顶层)
│   │       ├── ToolPreviewLayer (测量中的预览图形)
│   │       └── [Calibration Line Layer]
│   └── SidePanel
│       ├── ImageList       (图片列表/重命名)
│       └── MeasurementTree (测量结果树形展示)
```

### 状态管理 (6 个 zustand Store)

| Store | 职责 |
|-------|------|
| `useProjectStore` | 项目名称, 打开状态 |
| `useGridStore` | 行列数, 格子大小, 画布平移 |
| `useCalibrationStore` | µm/px 比例, displayZoom, 标定模式 |
| `useImagesStore` | 图片列表, CRUD, 格子间移动 |
| `useMeasurementsStore` | 测量记录, 增删 |
| `useToolStore` | 当前激活工具, 测量状态 |

### Konva 图层分层

自底向上:

| 层序 | 组件 | 职责 |
|------|------|------|
| 1 | GridLayer | 格子边框, 选中高亮 |
| 2 | ImageLayer | 图片渲染, 已完成测量图形 (Line, Circle, Text) |
| 3 | ToolPreviewLayer | 测量进行中的预览图形 |
| 4 | GridLabelsLayer | 图片文件名标签 |

### 测量工具插件体系

```
tools/
├── types.ts       # MeasurementTool 接口 + ShapeData 预览类型
├── registry.ts    # 工具注册表 (registerTool, getTool)
├── init.ts        # 工具自动注册 (App mount 时调用)
├── hLineTool.ts   # H 型距离测量
└── constrainedCircleTool.ts  # 限定圆测量
```

接口设计:
```typescript
interface MeasurementTool {
  id: string;
  name: string;
  onPointerDown(point): void;
  onPointerMove(point): void;
  onPointerUp(point): MeasurementData | null;
  getPreview(): ShapeData[];
  reset(): void;
}
```

新增工具只需实现接口 + `registerTool()` 即可集成。

## 数据持久化

| 机制 | 用途 |
|------|------|
| `project.json` | 项目文件夹内, 存储格子配置, 标定值, 图片列表, 测量数据 |
| `sessionStorage` | zustand `persist` middleware, 刷新恢复状态 (不影响浏览器历史) |
| `localStorage` | 全局项目索引 (recent projects) |

## 坐标系约定

- `offsetX/offsetY`: 图片左上角相对于格子左上角的偏移
- `imgGroup.x/y`: 图片中心在格子坐标系中的位置
- `Stage x/y`: 画布平移偏移
- `Stage scale`: 画布缩放
- `imgW = naturalWidth * displayZoom`: 图片渲染尺寸
- 详见 `docs/doc-coordinate-system.md`

## 开发环境

| 命令 | 说明 |
|------|------|
| `npm run dev` | HTTP dev server (localhost:5173) |
| `npm run dev:https` | HTTPS 代理 (0.0.0.0:5443), 外挂脚本自签证书 |
| `npm run build` | TypeScript 检查 + Vite 构建 |
| `npm run typecheck` | 仅 TypeScript 类型检查 |
| `npm run lint` | ESLint 检查 |
