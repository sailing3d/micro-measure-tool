---
title: Phase 4 — 标定 (像素-微米比例)
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-phase-4-calibration
summary: 标定 UI: 直接输入比例或图上画线标定, 全局共享.
status: done
related:
  - doc-architecture
  - doc-requirements
  - task-2026-05-26-phase-3-images
---

# Phase 4 — 标定

## 目标

设置像素-微米比例, 为测量工具提供换算依据.

## 任务清单

1. [ ] `CalibrationControls.tsx` — 工具栏: 显示当前 ratio, 直接输入数值, 进入画线标定模式
2. [ ] 画线标定流程: 在图片上画线段 → 输入实际微米数 → 计算 ratio = um / px
3. [ ] ratio 写入 calibrationStore, 持久化到 project.json

## 产出

- `src/components/toolbar/CalibrationControls.tsx`
- 可能的标定辅助组件 (CalibrationLine)

## 检查点

输入比例或画线后, ratio 值更新, 持久化到 project.json
