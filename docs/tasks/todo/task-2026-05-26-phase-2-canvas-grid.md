---
title: Phase 2 — 画布骨架 + 格子系统
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-phase-2-canvas-grid
summary: Konva Stage + GridLayer (格子渲染 + 右键平移), GridControls 工具栏.
status: todo
related:
  - doc-architecture
  - doc-requirements
  - task-2026-05-26-phase-1-foundation
---

# Phase 2 — 画布骨架 + 格子

## 目标

Konva 画布可交互: 渲染格子, 右键平移.

## 任务清单

1. [ ] `CanvasArea.tsx` — Konva Stage 容器, 绑定 gridStore 的 panOffset
2. [ ] `GridLayer.tsx` — 根据 rows/cols/cellSize 绘制格子边框, 编号标签, 处理右键 drag 更新 pan
3. [ ] `GridControls.tsx` — 工具栏中: rows, cols, cellWidth, cellHeight 输入框, 更新 gridStore
4. [ ] 响应式: window resize → 调整 Stage 尺寸

## 产出

- `src/components/canvas/CanvasArea.tsx`
- `src/components/canvas/GridLayer.tsx`
- `src/components/toolbar/GridControls.tsx`
- `src/components/toolbar/Toolbar.tsx` (更新)

## 检查点

画布显示格子, 右键拖动平移, 工具栏改行列数/格子大小实时更新
