---
title: 架构设计 — Micro Measure Tool
created: 2026-05-26
date: 2026-05-26
branch: task-2026-05-26-architecture
summary: 设计 zustand store, 组件树, Konva 图层, 数据流, 为后续实现提供技术蓝图.
status: done
related:
  - doc-requirements
  - doc-architecture
---

# 架构设计

## 目标

基于 `doc-requirements.md`, 产出技术架构文档 `docs/doc-architecture.md`.

## 步骤

1. [x] 设计 zustand store 结构 (6 个 store)
2. [x] 设计组件树 + Konva 图层组织
3. [x] 设计数据流 (File System API ↔ store ↔ UI)
4. [x] 输出 `docs/doc-architecture.md`
5. [x] 更新 `docs/doc-index.md`
6. [ ] 提交 + 用户确认 + 移到 done

## 决策记录

| 主题 | 决策 |
|------|------|
| 状态管理 | 多 Store 模式, 按职责分离 |
| Konva 图层 | 3 层: Grid → Image → Preview |
| 测量工具 | 插件接口 `MeasurementTool` + 注册表 |
| 自动保存 | zustand subscribe + debounce 500ms |
| 显示缩放 | contain 模式: `min(cellW/imgW, cellH/imgH)` |
