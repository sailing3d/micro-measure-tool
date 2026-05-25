---
title: 修复 Code Review 问题
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-fix-code-review
summary: 修复代码审核发现的 5 个严重问题 + 5 个中等问题.
status: doing
related:
  - doc-architecture
---

# 修复 Code Review 问题

## 严重 (P0)

1. [x] **限定圆无法完成测量** — 移除 adjust 阶段 onPointerDown 的取消逻辑
2. [x] **打开项目图片不显示** — readImageAsBlobUrl 创建 blob URL
3. [x] **画布平移不保存** — panX/panY 改用实际值
4. [x] **内存泄漏** — removeImage/setImages 时 revokeObjectURL
5. [x] **displayZoom 除零** — 添加 guard

## 中等 (P1)

6. [ ] 碰撞检测不考虑旋转, 测量关联图片不准
7. [ ] zustand selector 返回新对象, 不必要重渲染
8. [ ] 同名文件拖入静默覆盖

## 建议 (P2)

9. [ ] 类型断言过宽
10. [ ] Error Boundary 缺失
