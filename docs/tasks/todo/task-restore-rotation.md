---
title: 恢复单图旋转功能
created: 2026-05-26
date: 2026-05-26
summary: 移除单图缩放时连带移除了单图旋转 (Transformer), 需要独立恢复旋转交互.
status: todo
related:
  - doc-requirements
---

# 恢复单图旋转

## 背景

移除单图缩放 (Transformer) 时，Transformer 的旋转手柄和旋转功能也一并被移除。原需求要求图片可以旋转。

## 当前状态

- ImageGroup 无 Transformer, 无 `rotation` 的交互入口
- `imageData.rotation` 字段仍然存在，但无法通过 UI 修改 (只能重置为 0)
- 之前的右键拖动旋转方案已被删除

## 需要实现

- 图片旋转交互 (独立于缩放)
- 旋转围绕图片中心
- 不与右键平移冲突
