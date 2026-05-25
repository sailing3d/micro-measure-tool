---
title: Phase 1 — 公共类型, Store, ProjectService, App Shell
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-phase-1-foundation
summary: 建立类型定义, 6 个 zustand store, File System Access 服务封装, 启动对话框 + 布局骨架.
status: todo
related:
  - doc-architecture
  - doc-requirements
---

# Phase 1 — 基础设施

## 目标

建立项目运行骨架: 类型系统, 状态管理, 文件操作服务, UI 布局.

## 任务清单

1. [ ] `types/index.ts` — 所有公共类型 (Point, ImageData, MeasurementData, GridState, ...)
2. [ ] 6 个 zustand store (`stores/*.ts`) — 按 architecture 文档创建, 含基础 state + action stub
3. [ ] `services/projectService.ts` — 封装 File System Access API:
   - `createProject(folderHandle)` → 写 project.json
   - `openProject(folderHandle)` → 读 project.json, 枚举图片, 返回数据
   - `saveProject(data, folderHandle)` → 写 project.json
   - `copyImage(file, folderHandle)` → 复制文件到项目文件夹
   - `listProjects()` → 读全局索引
4. [ ] `StartupDialog.tsx` — 启动时选择新建/打开项目, 调用 ProjectService
5. [ ] `App.tsx` + `Layout` — 启动对话框 open → 进入布局 (Toolbar + CanvasArea + SidePanel), 三者空壳
6. [ ] 确认 typecheck + lint 通过

## 产出

- `src/types/index.ts`
- `src/stores/projectStore.ts`
- `src/stores/gridStore.ts`
- `src/stores/calibrationStore.ts`
- `src/stores/imagesStore.ts`
- `src/stores/measurementsStore.ts`
- `src/stores/toolStore.ts`
- `src/services/projectService.ts`
- `src/components/startup/StartupDialog.tsx`
- `src/App.tsx` (更新)
- typecheck + lint 通过

## 检查点

能新建项目 → 创建文件夹 + 写入 project.json → 进入布局界面 (三条空壳)
