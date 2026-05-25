---
title: Phase 3 — 图片管理 (拖入, 显示, 操作, 重命名)
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-phase-3-images
summary: 图片拖入格子, 复制到项目, Konva 渲染, 格内移动/旋转/缩放, 格子间交换, 侧面板重命名.
status: done
related:
  - doc-architecture
  - doc-requirements
  - task-2026-05-26-phase-2-canvas-grid
---

# Phase 3 — 图片管理

## 目标

完整图片生命周期: 拖入 → 显示 → 操作 → 管理.

## 任务清单

1. [ ] Konva Stage drop 事件 → 识别目标格子 → 调用 `copyImage` + `imagesStore.addImage`
2. [ ] `ImageGroup.tsx` — 单图片的 Konva Group: Konva.Image + Konva.Transformer (移动/旋转/缩放)
3. [ ] `ImageLayer.tsx` — 遍历 imagesStore 渲染所有 ImageGroup
4. [ ] contain 缩放: 首次拖入时计算 displayZoom, 后续所有图片共享
5. [ ] 格子间拖拽: 拖拽 ImageGroup 到另一个格子 → 交换 cellIndex 或移动
6. [ ] `ImageList.tsx` — 侧面板图片列表, 显示文件名, 支持重命名 (双击编辑)

## 产出

- `src/components/canvas/ImageLayer.tsx`
- `src/components/canvas/ImageGroup.tsx`
- `src/components/side-panel/ImageList.tsx`
- `src/components/side-panel/SidePanel.tsx`

## 检查点

拖入多张图片到不同格子, 格内移动/旋转/缩放, 交换, 侧面板显示+重命名
