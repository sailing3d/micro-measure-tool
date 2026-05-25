---
title: Phase 6 — 结果展示, 导出, 自动保存
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-phase-6-results
summary: 测量结果树形展示, 删除测量, Markdown/CSV 导出, 自动保存.
status: done
related:
  - doc-architecture
  - doc-requirements
  - task-2026-05-26-phase-5-measurement
---

# Phase 6 — 结果展示 + 导出 + 自动保存

## 目标

测量结果显示, 数据导出, 完整持久化闭环.

## 任务清单

1. [ ] `MeasurementTree.tsx` — 侧面板: 图片→测量名称→值 (树形), 层级: 图片 → 测量项 → 类型/值
2. [ ] 删除功能: 点击删除按钮 → removeMeasurement + Konva 图形消失
3. [ ] 导出 Markdown: `ProjectService.exportMarkdown()` → File System API 保存
4. [ ] 导出 CSV: `ProjectService.exportCSV()` → File System API 保存
5. [ ] 自动保存: zustand subscribe + debounce → `saveProject()`
6. [ ] `ProjectControls.tsx` — 工具栏: 导出下拉按钮

## 产出

- `src/components/side-panel/MeasurementTree.tsx`
- `src/components/toolbar/ProjectControls.tsx` (更新)
- `src/services/projectService.ts` (更新: export 方法)

## 检查点

测量结果显示; 删除生效; Markdown/CSV 导出文件正确; 自动保存写入 project.json
