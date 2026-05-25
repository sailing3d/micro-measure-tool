---
title: Phase 5 — 测量工具 (H-Line + 限定圆)
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-phase-5-measurement
summary: 工具注册框架, H 型长度测量, 限定圆测量, ToolPreviewLayer.
status: todo
related:
  - doc-architecture
  - doc-requirements
  - task-2026-05-26-phase-4-calibration
---

# Phase 5 — 测量工具

## 目标

实现两个测量工具, 建立可扩展的工具框架.

## 任务清单

1. [ ] `tools/types.ts` — MeasurementTool 接口
2. [ ] `tools/registry.ts` — 注册表 + registerTool / getTool
3. [ ] `tools/hLineTool.ts` — 实现:
   - onPointerDown: 记录起点
   - onPointerMove: 预览 H 型线段 (主测量线 + 两端横杆)
   - onPointerUp: 生成 MeasurementData, 含 pixels→µm 换算
4. [ ] `tools/constrainedCircleTool.ts` — 实现:
   - 阶段1: 画辅助轨迹线 (按下→拖动→松开)
   - 阶段2: 鼠标沿轨迹移动圆心, 垂直移动调半径, 预览圆
   - 确认: 点击左键生成 MeasurementData
5. [ ] `ToolPreviewLayer.tsx` — 渲染工具预览图形
6. [ ] `ToolSelector.tsx` — 工具栏工具切换
7. [ ] 测量结果图形渲染在 ImageGroup 内 (非交互)

## 产出

- `src/tools/types.ts`
- `src/tools/registry.ts`
- `src/tools/hLineTool.ts`
- `src/tools/constrainedCircleTool.ts`
- `src/components/canvas/ToolPreviewLayer.tsx`
- `src/components/toolbar/ToolSelector.tsx`

## 检查点

在图片上: H-Line 工具画线→显示结果; 限定圆工具画轨迹→调圆→确认→显示圆+结果
