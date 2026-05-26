# 第七章: 部署上线

本地开发完成后, 把应用放到网上, 让其他人用浏览器就能打开。

## 最简单的方案: Cloudflare Pages

Cloudflare Pages 是免费的静态网站托管服务, 自动 HTTPS, 全球 CDN 加速。

你的应用是纯前端 (没有服务器代码), 部署过程:

```
本地代码 → git push → GitHub Actions → 构建 → 上传 Cloudflare
```

## 第一次部署: 两件事

### 1. 获取 Cloudflare 凭据

两个值, 在 Cloudflare 官网获取:

- **Account ID**: Cloudflare Dashboard 右侧栏
- **API Token**: Cloudflare Dashboard → My Profile → API Tokens → Create Token → 选 "Edit Cloudflare Workers"

然后存到 GitHub Secrets (Settings → Secrets → Actions):

| Secret 名 | 值 |
|-----------|-----|
| `CLOUDFLARE_API_TOKEN` | 你的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Account ID |

### 2. 推送代码

```bash
git push origin main
```

推送后, GitHub Actions 自动运行: 安装依赖 → 检查代码 → 构建 → 发布到 Cloudflare。

## 部署配置长什么样

你需要三个文件, AI 帮你创建:

**`wrangler.toml`** (告诉 Cloudflare 项目叫什么)
**`.github/workflows/deploy.yml`** (告诉 GitHub 怎么做自动部署)
**`scripts/deploy.sh`** (本地手动部署时用)

你不用手写这三个文件。告诉 AI:

> "帮我配置 Cloudflare Pages 部署, 用 GitHub Actions, PR 预览也要"

AI 会创建这三个文件, 并告诉你需要在 GitHub Secrets 里填什么。

## 部署后的流程

每次你推送代码到 main 分支:
1. GitHub Actions 运行 (约 1-2 分钟)
2. 成功后, 你的网站自动更新
3. 新的 URL 通常是 `micro-measure-tool.pages.dev`

如果你推的是 PR (还没合并):
1. GitHub Actions 生成一个**临时预览 URL**
2. 你在 PR 页面能看到链接
3. 点进去就能看到这个 PR 版本的样子

## 自定义域名

在 Cloudflare Pages 控制面板 → Custom Domains → 添加你的域名。

Cloudflare 自动配置 DNS, 自动申请 SSL 证书。这一步完全不需要改代码。

## 你会遇到的对话

> **你**: "我想发布到 Cloudflare Pages, 全命令行脚本"
> **AI**: (创建 wrangler.toml + deploy.yml + deploy.sh)
> **你**: "我把 token 存到 GitHub Secrets 了, 怎么触发?"
> **AI**: "push main 自动触发, 去 Actions 标签看日志"

[上一页](06-pitfalls.md) | [下一页](appendix.md)
