---
name: dev-conventions
description: 跨项目可复用的通用开发规范: 文档, 任务管理, Git 工作流, Session 管理.
---

# 开发规范

## 重要提醒

- 提问而不是假设
  当前用户是资深人类开发者, 他可能知道一些你不知道的背景信息. 当不确定时, 提出澄清性问题而不是做出假设. 原定计划遇到问题时, 也是先提问再建议调整, 不要随意选择替代方案.

- 禁止不可恢复的操作
  禁止删除文件夹, 禁止从 git 仓库 checkout 覆盖当前工作区. 任何可能导致数据丢失的操作都必须先询问用户, 高危操作让用户帮忙完成.

## 文档规范

- 工作语言: 中文, 英文标点
- `docs/` 是长期记忆和技能库, 文件以 `doc-` 开头
- 树根为 `docs/doc-index.md`, 链接使用标准 markdown `[text](path.md)`
- 关键知识及时文档化, 维护好索引
- 定期整理文档, 保持清晰结构和目录, 允许重命名和拆分/合并/排重文档

### YAML Front Matter

所有 doc-_.md 和 task-_.md 必须在文件顶部包含 YAML Front Matter.

#### doc 文档

或特性文件, 以 `doc-` 开头, 记录需求, 设计, 特性等, 需要保持更新, 以反映最新状态.

```yaml
---
title: <文档标题>
created: <yyyy-mm-dd>
date: <yyyy-mm-dd>
summary: <一句话摘要>
related: # 可选: 相关文档/任务列表
  - doc-xxx
  - task-xxx
---
```

| 字段      | 必须 | 说明                                |
| --------- | ---- | ----------------------------------- |
| `title`   | 是   | 文档标题, 与 `# 标题` 一致          |
| `created` | 是   | 创建日期                            |
| `date`    | 是   | 最后修改日期                        |
| `summary` | 是   | 一句话描述文档内容                  |
| `related` | 否   | 相关文档 ID 列表 (不含路径和扩展名) |

#### task 任务文件

或计划文件, 以 `task-` 开头, 记录任务计划和执行状态, 在任务进行中持续更新, 记录关键决策和变更.

```yaml
---
title: <任务标题>
created: <yyyy-mm-dd> # 任务创建日期
date: <yyyy-mm-dd> # 最后更新日期或完成日期
branch: task-yyyy-mm-dd-xxx # 对应 Git 分支名
summary: <一句话摘要>
status: doing | done | todo
related: # 可选
  - doc-xxx
  - task-xxx
---
```

| 字段      | 必须 | 说明                      |
| --------- | ---- | ------------------------- |
| `title`   | 是   | 任务标题                  |
| `created` | 是   | 创建日期                  |
| `date`    | 是   | 最后更新或完成日期        |
| `branch`  | 是   | 对应 Git 分支名           |
| `summary` | 是   | 一句话描述                |
| `status`  | 是   | `doing` / `done` / `todo` |
| `related` | 否   | 相关文档/任务 ID 列表     |

## 任务管理

- 任务在 `docs/tasks/doing/`, 以 `task-yyyy-mm-dd` 开头

### 任务开始

- 开始前先读 AGENTS.md 和相关文档
- 开始任务时先指定计划, 并向用户提问, 让用户做出关键决策 (如果需要)

### 任务执行

- 执行中持续更新任务文件

### 任务完成

- 整理相关文档(包括 doc-* 和 task-*) 以及 Git 提交, 确保清晰记录决策和变更
- 和用户介绍当前情况, 并让用户确认当前任务已经完成
- 用户确认完成, 将 task 文档移至 `docs/tasks/done/`

## Git 工作流

### 任务分支工作流

每次开始新 task (用户指定 `docs/tasks/doing/task-yyyy-mm-dd-xxx.md` 或描述新任务), 必须建立新分支.

```bash
# 1. 从开发分支创建任务分支
git checkout -b task-yyyy-mm-dd-xxx

# 2. 在任务分支上工作, 过程中可多次提交
git add ... && git commit -m "..."

# 3. 任务完成后, 清理提交历史
#    - 用 git rebase -i 合并 WIP/反复/无意义的提交
#    - 保留有意义的, 逻辑独立的提交
#    - 每个 commit message 保持清晰, 描述做了什么和为什么

# 4. Rebase 到开发分支 (线性历史, 无 merge commit)
git fetch origin
git rebase origin/main

# 5. 合并到开发分支
git checkout main
git merge task-yyyy-mm-dd-xxx --ff-only   # 快进合并, 保持线性

# 6. 保留任务分支, 以备后续回顾和文档链接, 但不推送
```

### 原则

- 一个 task 对应一个分支, 分支名与 task 文件对应
- 完成后必须 rebase, 拒绝 merge commit (保持历史线性)
- 每个 commit 独立有意义, 避免 "fix" "WIP" "update" 等模糊提交
- 任务分支不推送远程, 仅在本地保留, 以便后续回顾和文档链接

## Session 管理

- 灵活使用 SubAgent 协同复杂任务
- 上下文压缩后重新阅读本文档
- 多 Agent 多 Session 环境, 重要信息必须文档化

## 依赖管理

- 本项目采用 monorepo 结构, 根目录下的 `package.json` 管理所有依赖
- 公共库放在 `packages/@sailing3d/` 下, 本项目包放在 `packages/@micro-measure-tool/` 下
- 依赖更新必须在根目录执行, 确保所有子项目使用相同版本的公共依赖
