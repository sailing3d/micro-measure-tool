# 第六章: 常见坑与教训

以下坑都来自本项目的真实经历。知道它们, 能让你少走弯路。

## 1. 坐标系混乱

**现象**: 图片拖到其他格子后位置跳动, 缩放后重置位置歪了。

**原因**: Konva 画布的坐标系统有 "父节点内坐标" 和 "全局坐标" 之分。你拖图片时, AI 用 `node.x()` 读到了父节点内的坐标, 但在计算格子位置时又用了全局坐标——两者差了一个偏移。

**教训**: 如果 AI 多次修不好一个位置相关的问题, 提示它 "检查坐标系是否一致", 让它去写文档记录教训 (本项目后来就写了 `doc-coordinate-system.md`)。

## 2. 浏览器限制

**现象**: 在局域网 IP 上打开应用, `showDirectoryPicker` 报错 "is not a function"。

**原因**: File System Access API 只在安全上下文 (HTTPS 或 localhost) 下可用。局域网 IP 没有 HTTPS, API 直接不可用。

**解决**: 开发阶段用 `localhost`, 上线后用 Cloudflare Pages (自动 HTTPS)。

## 3. 文件变更后 AI 遗漏同步

**现象**: 某次 AI 改了一个文件 A, 但忘记更新引用它的文件 B, 导致编译报错。

**方案**: 每次改动后让 AI 运行 `npm run typecheck` 和 `npm run lint`, 它会自动发现遗漏的引用。

## 4. 图片 URL 不持久

**现象**: 项目保存了图片的文件名, 刷新后就找不到了。

**原因**: 浏览器中的图片是通过 `blob:` URL 临时加载的, 刷新即失效。AI 需要用 File System Access API 重新读取文件。

**教训**: 告诉 AI: "刷新后恢复项目时, 图片要从项目文件夹重新读取, 不能沿用旧 URL"。

## 5. 状态管理的无限循环

**现象**: 页面打开就报错 "Maximum update depth exceeded", 白屏卡死。

**原因**: zustand 的状态更新触发了 React 重渲染, 重渲染又触发了状态读取, 形成了死循环。

**诊断**: 这通常是一个很小的改动引入的——比如某个函数返回了一个新对象而不是值。AI 通过代码审查找到了 6 处这类问题。

## 6. WebSocket 代理

**现象**: 把应用通过 HTTPS 代理发布后, 页面疯狂报 WebSocket 连接错误。

**原因**: Vite 的热更新 (HMR) 依赖 WebSocket, 而 HTTPS 代理没有正确转发 WebSocket 连接。

**方案**: 开发阶段不要去折腾代理的 WebSocket。用 `localhost` 开发, 部署后不需要 HMR。

## 核心教训

| 坑 | 信号 | 你做什么 |
|----|------|---------|
| 坐标混乱 | 拖拽/缩放位置反复跳动 | "检查坐标系" |
| 死循环 | 页面白屏, console 报 Maximum update | "有死循环, 检查状态更新" |
| 数据不持久 | 刷新后图片/状态丢失 | "数据没保存/没恢复" |
| 浏览器限制 | API not found / not a function | "这个 API 需要 HTTPS 吗" |

[上一页](05-test-iterate.md) | [下一页](07-deploy.md)
