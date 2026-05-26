---
title: 架构设计 — Micro Measure Tool
created: 2026-05-26
date: 2026-05-26
summary: 技术架构设计: 状态管理, 组件树, Konva 图层, 数据流, 测量工具插件体系. 更新至迭代改进后版本.
related:
  - doc-requirements
---

# 架构设计

## 1. 概述

基于 `doc-requirements.md`, 本文档定义 Micro Measure Tool 的技术架构: 状态管理 (zustand), 组件层级, Konva 图层组织, 数据流, 以及测量工具的插件化设计。

## 2. 状态管理 (zustand)

采用**多 Store 模式**, 按职责分离:

### 2.1 Store 清单

| Store | 职责 |
|-------|------|
| `useProjectStore` | 当前项目名称, 路径, 是否已打开 |
| `useGridStore` | 行数, 列数, 格子宽高, 画布平移偏移 |
| `useCalibrationStore` | 像素-微米比例, 显示缩放 |
| `useImagesStore` | 图片列表, 增删改, 格子分配, 变换 (位置/旋转/缩放) |
| `useMeasurementsStore` | 每条测量记录, 按图片组织, 增删 |
| `useToolStore` | 当前激活工具, 预览图形, 测量进行状态 |

### 2.2 Store 接口

```typescript
// ============ useProjectStore ============
interface ProjectState {
  name: string;
  folderHandle: FileSystemDirectoryHandle | null;
  isOpen: boolean;
}
// actions: openProject(), closeProject()

// ============ useGridStore ============
interface GridState {
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  panX: number;
  panY: number;
}
// actions: setRows(), setCols(), setCellSize(), setPan()

// ============ useCalibrationStore ============
interface CalibrationState {
  ratio: number;       // µm/pixel
  displayZoom: number;
}
// actions: setRatio(), setDisplayZoom()

// ============ useImagesStore ============
interface ImageData {
  id: string;
  filename: string;
  filepath: string;     // 项目文件夹内路径
  cellIndex: number;
  offsetX: number;      // 格内偏移
  offsetY: number;
  rotation: number;     // 度
  scale: number;        // 格内额外缩放
}
interface ImagesState {
  images: ImageData[];
}
// actions: addImage(), removeImage(), updateImage(), moveImageToCell()

// ============ useMeasurementsStore ============
interface Point { x: number; y: number; }

interface MeasurementData {
  id: string;
  imageId: string;
  name: string;         // 默认 "测量 1"
  type: "h-line" | "constrained-circle";
  // h-line
  points?: [Point, Point];
  lengthPx?: number;
  lengthUm?: number;
  // constrained-circle
  trajectory?: [Point, Point];
  center?: Point;
  radiusPx?: number;
  diameterUm?: number;
}
interface MeasurementsState {
  measurements: MeasurementData[];
}
// actions: addMeasurement(), removeMeasurement()

// ============ useToolStore ============
interface ToolState {
  activeToolId: string | null;
  isMeasuring: boolean;
}
// actions: selectTool(), startMeasuring(), finishMeasuring()
```

## 3. 组件树

```
App
├── StartupDialog          ← 启动时: 新建项目 / 打开已有
├── Layout
│   ├── Toolbar
│   │   ├── ProjectControls (新建, 打开, 导出 Markdown/CSV)
│   │   ├── GridControls   (rows, cols, cellWidth, cellHeight)
│   │   ├── CalibrationControls (设置比例, 显示缩放)
│   │   └── ToolSelector   (h-line, constrained-circle, ...)
│   ├── CanvasArea
│   │   └── KonvaStage
│   │       ├── <Layer> GridLayer
│   │       │   └── CellRect[]  (格子边框, 非交互)
│   │       ├── <Layer> ImageLayer
│   │       │   └── ImageGroup[] (每个图片一个 Group)
│   │       │       ├── KonvaImage
│   │       │       ├── MeasurementShapes[] (已完成的测量线/圆, 非交互)
│   │       │       └── KonvaTransformer (缩放/旋转控件)
│   │       └── <Layer> ToolPreviewLayer
│   │           └── PreviewShapes[] (测量进行中的临时图形)
│   └── SidePanel
│       ├── ImageList       (图片文件名, 支持重命名)
│       └── MeasurementTree  (图片 → 测量名 → 结果, 支持删除)
```

## 4. Konva 图层设计

自底向上 3 个 Layer:

| 层序 | 名称 | 交互 | 内容 |
|------|------|------|------|
| 1 | **GridLayer** | 右键拖动 → 平移画布 | 格子边框矩形, 编号标签 |
| 2 | **ImageLayer** | 左键拖图片/旋转/缩放, 拖拽到其他格子 | KonvaImage + 已完成的测量图形 |
| 3 | **ToolPreviewLayer** | 跟随鼠标的绘制预览 | 测量工具在绘制中的临时图形 |

### 坐标空间

- **Stage 坐标** = 画布全局坐标 (受 panOffset 影响)
- **Cell 坐标** = 格子左上角为原点
- **Image 坐标** = 图片本身上角为原点

Stage 配置 `x={panX} y={panY}` 实现画布平移。

## 5. 测量工具插件

### 5.1 工具接口

```typescript
interface MeasurementTool {
  id: string;
  name: string;
  // 绘制生命周期
  onPointerDown(point: Point, imageId: string): void;
  onPointerMove(point: Point): KonvaShape[];   // 返回预览图形
  onPointerUp(point: Point): MeasurementData | null;  // null = 取消
}
```

### 5.2 工具注册表

```typescript
const toolRegistry = new Map<string, MeasurementTool>();
registerTool(tool);   // 注册新工具
getTool(id);          // 获取工具实例
getToolIds();         // 列出所有工具 ID
```

后期新增测量工具只需: 实现 `MeasurementTool` 接口 + 调用 `registerTool()`.

### 5.3 工具实现要点

**H-Line 工具:**
- `onPointerDown`: 记录起点
- `onPointerMove`: 预览线段 (起点→当前鼠标), 同时渲染 H 型横杆
- `onPointerUp`: 生成 `MeasurementData` (type: "h-line")

**ConstrainedCircle 工具:**
- 阶段 1 — 画轨迹: `onPointerDown` → `onPointerMove` → `onPointerUp` 完成辅助线
- 阶段 2 — 调圆: `onPointerMove` 后将鼠标投影到轨迹线上作圆心, 垂直距离作半径, 实时预览圆
- 阶段 3 — 确认: 再次 `onPointerDown` 生成 `MeasurementData` (type: "constrained-circle")

## 6. 数据流

```
File System Access API
      ↕  (read/write JSON, copy image files)
┌──────────────────┐
│  ProjectService   │  封装文件操作: loadProject, saveProject, copyImage, exportData
└──────────────────┘
      ↕  (dispatch actions)
┌──────────────────┐
│  zustand stores   │  项目 / 网格 / 标定 / 图片 / 测量 / 工具
└──────────────────┘
      ↕  (useStore hooks)
┌──────────────────┐
│  React 组件        │  Toolbar, CanvasArea, SidePanel
│  + Konva Stage    │  渲染图片, 测量图形, 工具预览
└──────────────────┘
```

### 6.1 关键流程

**打开项目:**
1. 用户通过 File System Access API 选择文件夹
2. `ProjectService.loadProject()` 读取 `project.json` + 枚举图片文件
3. 填充 `projectStore`, `gridStore`, `calibrationStore`, `imagesStore`, `measurementsStore`
4. `ImageLayer` 创建 Konva.Image 对象并渲染

**添加图片:**
1. 用户拖文件到目标格子 (通过 drop 事件获取 File 对象 + 目标 cellIndex)
2. `ProjectService.copyImage(file, folderHandle)` 复制到项目文件夹
3. `imagesStore.addImage({ filename, cellIndex, ... })`
4. `ImageLayer` 创建新 Konva.Image, 计算 `contain` 缩放

**执行测量:**
1. 用户在 Toolbar 选择工具 → `toolStore.selectTool(id)`
2. 用户在主画布上按下/移动/松开 → Konva Stage 事件转发给工具实例
3. 工具实例通过 `toolStore` 发布预览图形 → 渲染在 `ToolPreviewLayer`
4. 完成时生成 `MeasurementData` → `measurementsStore.addMeasurement()`
5. 测量图形从 `ToolPreviewLayer` 移至 `ImageLayer` (作为非交互渲染)

**自动保存:**
- 各 Store 使用 zustand `subscribe` 监听数据变更
- 防抖 (debounce 500ms) 后调用 `ProjectService.saveProject()`
- 写入 `project.json`

**导出:**
- 从 `measurementsStore` 读取所有测量
- 按图片分组, 格式化为 Markdown 表格 / CSV
- 通过 File System Access API 让用户选择保存位置

## 7. 目录结构

```
packages/@micro-measure-tool/app/src/
├── main.tsx
├── App.tsx
├── stores/
│   ├── projectStore.ts
│   ├── gridStore.ts
│   ├── calibrationStore.ts
│   ├── imagesStore.ts
│   ├── measurementsStore.ts
│   └── toolStore.ts
├── services/
│   └── projectService.ts        # File System Access API 封装
├── components/
│   ├── startup/
│   │   └── StartupDialog.tsx
│   ├── toolbar/
│   │   ├── Toolbar.tsx
│   │   ├── ProjectControls.tsx
│   │   ├── GridControls.tsx
│   │   ├── CalibrationControls.tsx
│   │   └── ToolSelector.tsx
│   ├── canvas/
│   │   ├── CanvasArea.tsx
│   │   ├── GridLayer.tsx
│   │   ├── ImageLayer.tsx
│   │   ├── ImageGroup.tsx
│   │   └── ToolPreviewLayer.tsx
│   └── side-panel/
│       ├── SidePanel.tsx
│       ├── ImageList.tsx
│       └── MeasurementTree.tsx
├── tools/
│   ├── registry.ts              # 工具注册表
│   ├── types.ts                 # MeasurementTool 接口
│   ├── hLineTool.ts
│   └── constrainedCircleTool.ts
└── types/
    └── index.ts                 # 公共类型
```

## 8. 要点

| 要点 | 说明 |
|------|------|
| 显示缩放计算 | `displayZoom = min(cellWidth / imgWidth, cellHeight / imgHeight)` (contain) |
| 交换图片 | 拖拽图片到占用格子 → 交换 cellIndex |
| 画布平移 | Stage `x/y` 绑定 `panOffset`, 右键 drag 更新 |
| 标定设置 | 画标定线 → `ratio = 输入微米值 / 线段像素长度` |
| 自动命名 | 测量名称递增: `测量 1`, `测量 2`, ... |
| 删除测量 | 从 `measurementsStore` 移除, Konva 图形随之消失 |
