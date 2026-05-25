---
title: Phase 1 — 公共类型, Store, ProjectService, App Shell
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-phase-1-foundation
summary: 建立类型定义, 6 个 zustand store, File System Access 服务封装, 启动对话框 + 布局骨架.
status: done
related:
  - doc-architecture
  - doc-requirements
---

# Phase 1 — 基础设施

## 目标

建立项目运行骨架: 类型系统, 状态管理, 文件操作服务, UI 布局.

## 任务清单

1. [x] `types/index.ts` — 所有公共类型
2. [x] 6 个 zustand store — 含基础 state + action
3. [x] `services/projectService.ts` — File System Access API 封装
4. [x] `StartupDialog.tsx` — 新建/打开项目
5. [x] `App.tsx` + 布局 (Toolbar + CanvasArea + SidePanel)
6. [x] typecheck + lint 通过

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
- `src/components/toolbar/Toolbar.tsx`
- `src/components/canvas/CanvasArea.tsx`
- `src/components/side-panel/SidePanel.tsx`
- `src/App.tsx` (重写)
- `vite-env.d.ts` (新增 File System Access API 类型)
