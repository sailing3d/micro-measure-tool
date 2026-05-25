---
title: 坐标系经验教训 — Konva 多层嵌套的坐标陷阱
created: 2026-05-26
date: 2026-05-26
summary: 记录本项目中 Konva 多层 Group 嵌套导致的坐标系统混淆问题及解决方式.
related:
  - doc-architecture
---

# 坐标系经验教训

## 问题背景

ImageGroup 的 Konva 结构为多层嵌套:

```
Stage (scaleX/Y=canvasZoom, x/y=pan)       ← 画布级别缩放+平移
└── ImageLayer
    └── clipGroup (x=cellX, y=cellY)        ← 裁剪格, 已有平移
        └── imgGroup (x=..., y=...)          ← 图片节点, draggable
            └── KonvaImage
```

imgGroup 的父节点 clipGroup 已经做了 `(cellX, cellY)` 平移，而 Stage 有 `panX/panY` 平移和 `scale` 缩放。

## 核心教训

### `node.x()` vs `node.getAbsolutePosition()`

| 方法 | 返回值 | 适用场景 |
|------|--------|---------|
| `node.x()` | 相对**直接父节点**的局部坐标 | 仅当父节点无平移时可用 |
| `node.getAbsolutePosition()` | 相对 Stage 的全局坐标 | 需要计算绝对位置时（拖放、碰撞检测） |

**`node.x()` 的坐标原点会随着父节点的 `x/y` 改变而改变。** clipGroup 设了 `x=cellX, y=cellY` 后，imgGroup 的 `node.x()` 返回的是 clipGroup 内的相对位置，不是 Stage 坐标。

### 错误示例 (拖放计算)

```typescript
// 错误: node.x() 是 clipGroup 内的局部坐标
const nx = node.x();
const nc = Math.floor((nx - PADDING) / cellWidth);  // PADDING 和 cellWidth 是 Stage 坐标
// → nx 的坐标系与 PADDING/cellWidth 不一致！结果错！
```

### 正确示例

```typescript
// 正确: 用 getAbsolutePosition() 获取 Stage 坐标
const pos = node.getAbsolutePosition();
const nx = pos.x;
const nc = Math.floor((nx - PADDING) / cellWidth);
// → 现在 nx 和 PADDING/cellWidth 在同一坐标系 → 正确
```

### `getPointerPosition()` vs `getRelativePointerPosition()`

当 Stage 有 `scaleX/scaleY` (画布缩放) 时:

| 方法 | 返回 |
|------|------|
| `stage.getPointerPosition()` | 屏幕坐标 (不受 Stage scale 影响) |
| `stage.getRelativePointerPosition()` | Stage-local 坐标 (经过 Stage scale 变换) |

**画布缩放后必须用 `getRelativePointerPosition()`**，否则鼠标位置和 Konva 节点位置不在同一坐标系。

## 正确实践

### 1. 节点位置使用局部坐标

当父节点已做平移时，子节点用局部坐标：

```tsx
<Group x={cellX} y={cellY}>            {/* 父: 已平移到格子位 */}
    <Group x={offsetX + imgW/2} ... />  {/* 子: 格子内局部坐标 */}
</Group>
```

**不要让子节点自己加 cellX/cellY**，否则会产生双重偏移。

### 2. 拖放/碰撞使用绝对坐标

```typescript
const pos = node.getAbsolutePosition();  // Stage 坐标
const cellCol = Math.floor((pos.x - PADDING) / cellWidth);
const cellRow = Math.floor((pos.y - PADDING) / cellHeight);
```

### 3. 测量工具使用相对坐标

```typescript
// 鼠标位置需要 Stage-local
const pos = stage.getRelativePointerPosition();
tool.onPointerDown(pos);
```

### 4. `handleTransformEnd` 后正确处理节点状态

```typescript
// Transformer 修改了节点的 scaleX 和 rotation
const newScale = node.scaleX();
const newRot = node.rotation();

// 重置 scale 让 React 重新接管 (React 会设 scaleX={newScale})
node.scaleX(1);
node.scaleY(1);
// 不重置 rotation (值相同，React 无需更新 → 无抖动)
updateImage(id, { scale: newScale, rotation: newRot });
```

## 总结

| 原则 | 说明 |
|------|------|
| 局部坐标给 React props | 子节点 x/y 是相对父节点的，不要重复父节点偏移 |
| 绝对坐标给逻辑计算 | `getAbsolutePosition()` 保证与 Stage 坐标一致 |
| 相对坐标给指针事件 | 画布缩放后 `getRelativePointerPosition()` 确保坐标系对齐 |
| 先算后设 | 节点位置应先确定在哪个坐标系，再决定用哪个 API |
