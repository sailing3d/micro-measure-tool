---
title: 修复 Code Review 问题
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-fix-code-review
summary: 修复代码审核发现的 5 个严重问题 + 5 个中等问题.
status: todo
related:
  - doc-architecture
---

# 修复 Code Review 问题

## 严重 (P0)

1. [ ] **限定圆无法完成测量** — adjust 阶段 `onPointerDown` 设 phase=idle, 点击永远无法确认 (`constrainedCircleTool.ts`)
2. [ ] **打开项目图片不显示** — filepath 用文件名当 URL, imageHandles 被丢弃 (`StartupDialog.tsx`)
3. [ ] **画布平移不保存** — toProjectData 中 panX/panY 硬编码 0 (`projectService.ts`)
4. [ ] **内存泄漏** — URL.createObjectURL 未释放 (`CanvasArea.tsx`)
5. [ ] **displayZoom 除零** — 无 guard 检查 (`CanvasArea.tsx`)

## 中等 (P1)

6. [ ] 碰撞检测不考虑旋转, 测量关联图片不准 (`CanvasArea.tsx`)
7. [ ] zustand selector 返回新对象, 不必要重渲染 (多处)
8. [ ] 同名文件拖入静默覆盖 (`projectService.ts`)

## 建议 (P2)

9. [ ] 类型断言过宽 (`ToolPreviewLayer.tsx`)
10. [ ] Error Boundary 缺失
