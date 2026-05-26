# Micro Measure Tool

显微镜图像归集与测量 Web 应用. 纯前端, 通过 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) 读写本地文件夹.

## 快速开始

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev:https      # https://0.0.0.0:5443 (远程访问用)
npm run build          # 构建
npm run typecheck      # 类型检查
npm run lint           # 代码规范
```

## 技术栈

Vite + React 19 + TypeScript + Tailwind CSS v4 + zustand + Konva.js

详见 [技术栈总结](docs/doc-tech-stack.md).

## 文档

| 文档 | 说明 |
|------|------|
| [产品需求](docs/doc-requirements.md) | 功能需求, 交互模型, 数据格式 |
| [架构设计](docs/doc-architecture.md) | Store, 组件树, Konva 图层, 测量插件, 数据流 |
| [坐标系教训](docs/doc-coordinate-system.md) | `node.x()` vs `getAbsolutePosition()` 陷阱 |
| [技术栈](docs/doc-tech-stack.md) | 全部依赖库和设计模式 |
| [索引](docs/doc-index.md) | 文档总目录 |

## 项目结构

```
packages/@micro-measure-tool/app/src/
├── types/           公共类型
├── stores/          6 个 zustand store (project/grid/calibration/images/measurements/tool)
├── services/        File System Access API + IndexedDB
├── components/
│   ├── startup/     启动对话框
│   ├── toolbar/     工具栏 (项目/格子/标定/工具/帮助)
│   ├── canvas/      Konva 画布 (4 层: Grid/Image/Preview/Labels)
│   └── side-panel/  图片列表 + 测量结果树
└── tools/           测量工具插件 (H 型距离 + 限定圆)
```

## 浏览器要求

Chrome / Edge (File System Access API). 非 localhost 访问需 HTTPS。
