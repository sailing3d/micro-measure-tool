---
title: P2 — Code Review 中等/建议问题
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-fix-code-review
summary: 碰撞检测旋转, zustand selector 已修复, 同名文件覆盖, 类型断言, Error Boundary.
status: todo
related:
  - task-2026-05-26-fix-code-review
---

# P2 Code Review 遗留问题

6. [ ] **碰撞检测不考虑旋转** — findImageAtPoint 的 axis-aligned 检测对旋转后的图片不准 (`CanvasArea.tsx`)
7. [x] **zustand selector 返回新对象** — 已修复, 改用独立 selector + useShallow
8. [ ] **同名文件拖入静默覆盖** — copyImageToProject 不检查重名 (`projectService.ts`)
9. [ ] **类型断言过宽** — ToolPreviewLayer 大量 `as number` 等, 可用泛型收紧 (`ToolPreviewLayer.tsx`)
10. [ ] **Error Boundary 缺失** — App 无错误边界, 异常会白屏
