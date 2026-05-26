---
title: 迭代改进 — 交互修复, 测量重构, 导出增强
created: 2026-05-26
date: 2026-05-26
branch: main (多分支合并)
summary: 记录 Phase 6 之后的所有迭代改进, 包括坐标系修复, 测量工具重构 (H型/限定圆), 导出功能, UI 交互优化.
status: doing
related:
  - doc-requirements
  - doc-architecture
  - doc-coordinate-system
---

# 迭代改进

## 坐标系修复

| 提交 | 问题 | 修复 |
|------|------|------|
| `d3fe8ec` | 图片交互6个问题 (裁剪, 边界, 缩放, 旋转, 清空) | clipX/Y, dragBoundFunc, Transformer |
| `1e7bd04` | 缩放丢失旋转 | getAbsoluteScale/getAbsoluteRotation |
| `4aefc23` | 旋转+缩放冲突 | rotateEnabled=false, 右键旋转 |
| `0821caa` | 旋转/缩放解耦 | scaleChanged 检测 |
| `e933bf2` | 位置跳动+旋转中心+滚轮缩放 | 分离 position/transform Group |
| `7875094` | sessionStorage + cover模式 | persist middleware, Math.max |
| `6f5b01a` | 缩放/旋转最终分离 | Transformer scale only, 右键 rotate |
| `4360592` | 缩放位置跳动 | imgW/2 替代 visW/2 |
| `993bc96` | 重置按钮居中 | offset = (cell-img)/2 |
| `a867ba9` | 单 Group 结构 | Image自身 offset 居中 |
| `0c8a0ec` | 拖放坐标系统修复 | getAbsolutePosition + getRelativePointerPosition |
| `c4640f3` | 坐标系文档 | doc-coordinate-system.md |

## 测量工具重构

| 提交 | 改动 |
|------|------|
| `8e9c4dd` | 点击两点画线 + 标定/测量锁定拖动 |
| `3f6a7e2` | 测量仅限图片上 + lengthUm = lengthPx/displayZoom*ratio |
| `5a5e243` | 标定后数值同步 + 已有测量重算 |
| `442a97a` | 标定/测量工具互斥 |
| `75e90eb` | 标定琥珀色 vs 测量蓝色 |
| `6430be7` | 标定按钮固定宽度 + 仅限图片上点击 |
| `18d2b09` | 限定圆一条线多圆 + ESC 退出 |
| `3aee9d4` | 长度测量改为 H 型距离测量 |
| `baa95f0` | H 型实时距离数值 |
| `5bf0e7c` | 距离标签字号+fontFamily |
| `ca9f3ab` | 去掉连线圆圈, 保留距离值文本 |
| `04c7b0c` | 颜色改为 teal/cyan, 不再用 amber |
| `93030d9` | 限定圆直径标签 + 在已有轨迹线上新增圆 |

## 缩放模型重构

| 提交 | 改动 |
|------|------|
| `c6ed233` | 移除单图缩放, 全局 displayZoom + Zoom 控件 |
| `3cc15f2` | Zoom 重置按钮 + 右键平移不误选 |
| `d4db80d` | 工具栏排序 + 备忘单图旋转 |

## 测量-图像双向高亮

| 提交 | 改动 |
|------|------|
| `8a7338b` | highlightedImageId → 测量图形 ↔ 测量数据 |
| `6a8f9ed` | 改为 highlightedMeasurementId, GridLabelsLayer, 图形标号 |
| `3403161` | 文字白色描边 |
| `b094a34` | 描边更细 + fillAfterStrokeEnabled |

## 导出功能

| 提交 | 改动 |
|------|------|
| `f641a02` | CSV/Markdown 加 UTF-8 BOM |
| `7b523cc` | 导出画布为 PNG |
| `92c1c2b` | 导出整幅画布 (非截图, 临时全尺寸渲染) |

## 其他修复

| 提交 | 改动 |
|------|------|
| `f952b1b` | ImageLayer useEffect 无限循环 |
| `5accff6` | zustand selector 无限循环 (useShallow) |
| `5cdb6c5` | Code Review 遗留问题记入 todo |

## 已知待处理

- [ ] 恢复单图旋转功能 (`task-restore-rotation.md`)
- [ ] Code Review P2 问题 (`task-p2-code-review-followup.md`): 碰撞检测旋转, 同名文件覆盖, 类型断言, Error Boundary
