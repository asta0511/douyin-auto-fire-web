# 抖音续火花 - 配置管理面板

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel)](https://douyin-auto-fire-web.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=flat-square&logo=github)](https://github.com/asta0511/douyin-auto-fire-web)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> 为 [douyin-auto-fire](https://github.com/asta0511/douyin-auto-fire) 提供 Web 端配置管理界面。通过可视化表单，在线管理 GitHub Secrets，无需手动编辑仓库配置。

---

## 项目简介

[douyin-auto-fire](https://github.com/asta0511/douyin-auto-fire) 是一个基于 Python + Playwright 的抖音自动续火花工具，通过 GitHub Actions 定时运行。但每次修改配置（好友列表、发送内容等）都需要手动编辑 GitHub Secrets，操作繁琐且容易出错。

**douyin-auto-fire-web** 就是为解决这个问题而生的——一个可部署在 Vercel 的 Web 管理面板，让你通过浏览器就能轻松管理配置。

### 解决的问题

- ❌ **不用再手动编辑 GitHub Secrets**
- ❌ **不用再重新运行部署流程**
- ✅ **可视化表单编辑 Config 配置**
- ✅ **在线更新 Cookie**
- ✅ **一键保存到 GitHub Secrets**

---

## 功能特性

### 概览仪表盘
- 实时查看 `DOUYIN_COOKIE` 和 `DOUYIN_CONFIG` 两个 Secret 的配置状态
- 显示每个 Secret 是否存在、最后更新时间
- 快速切换到对应的编辑页面

### Cookie 管理
- 文本编辑框，粘贴 Cookie 内容
- 保存后自动加密写入 GitHub Secrets
- 显示字符数统计

### Config 配置编辑
- **导入配置**：支持上传 JSON 文件或粘贴 JSON 文本，自动解析填充表单
- **好友管理**：标签式输入框，支持添加/删除好友昵称
- **消息配置**：支持贴纸、文字、图片三种消息类型，可添加多条
- **Stickers 管理**：贴纸定义，支持 JSON 编辑
- **发送设置**：间隔时间（最小/最大）
- **开关选项**：出错继续、防重复发送
- **高级设置**：重试次数、超时时间

### 安全
- 密码登录保护，防止未授权访问
- 所有操作需通过 Session 认证
- GitHub Token 和密码均以环境变量形式存储，不暴露在代码中

---

## 部署教学

### 前置准备

1. **GitHub 账号** 和 **Vercel 账号**（推荐用 GitHub 登录 Vercel）
2. **GitHub Personal Access Token**，需要有 `repo` 权限
3. **douyin-auto-fire 项目**已配置好 GitHub Actions 并正常运行

### 第一步：生成 GitHub Token

1. 打开 [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token** → **Generate new token (classic)**
3. 设置名称（如 `douyin-auto-fire-web`），过期时间按需选择
4. 勾选权限：**`repo`**（全选）
5. 点击 **Generate token**，**复制并保存好 Token**（页面关闭后无法再次查看）

### 第二步：部署到 Vercel

#### 方式一：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fasta0511%2Fdouyin-auto-fire-web)

点击上方按钮，按提示操作：

1. 用 GitHub 登录 Vercel
2. 导入 `asta0511/douyin-auto-fire-web` 仓库
3. 在 **Environment Variables** 页面添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PASSWORD` | `你的登录密码` | 访问管理面板的密码 |
| `GITHUB_TOKEN` | `你的 GitHub Token` | 用于更新 Secrets 的令牌 |
| `GITHUB_REPO` | `你的用户名/douyin-auto-fire` | 目标仓库（需要更新 Secrets 的仓库） |

4. 点击 **Deploy**，等待部署完成

#### 方式二：Fork 后手动部署

1. **Fork 本仓库**到你的 GitHub 账号下
2. 打开 [Vercel](https://vercel.com)，点击 **Add New** → **Project**
3. 选择你 Fork 的仓库，点击 **Import**
4. 在 **Environment Variables** 中添加上述三个变量
5. 点击 **Deploy**

### 第三步：配置自定义域名（可选）

1. 在 Vercel 项目页面进入 **Settings** → **Domains**
2. 输入你的域名，点击 **Add**
3. 按照 Vercel 提示在你的 DNS 服务商处添加 CNAME 记录
4. 等待 SSL 证书自动签发（通常几分钟）

### 第四步：使用

1. 打开部署后的域名（如 `https://douyin-auto-fire-web.vercel.app`）
2. 输入你设置的 `PASSWORD` 登录
3. 在 **概览** 页面查看当前 Secrets 状态
4. 切换到 **Cookie 管理** 或 **Config 配置** 进行编辑
5. 编辑完成后点击保存，配置会自动同步到 GitHub Secrets
6. 下次 GitHub Actions 运行时将自动使用新配置

---

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `PASSWORD` | ✅ | 管理面板的登录密码 |
| `GITHUB_TOKEN` | ✅ | GitHub Personal Access Token，需有 `repo` 权限 |
| `GITHUB_REPO` | ✅ | 需要更新 Secrets 的仓库，格式：`用户名/仓库名` |

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/asta0511/douyin-auto-fire-web.git
cd douyin-auto-fire-web

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env.local
# 编辑 .env.local，填入 PASSWORD、GITHUB_TOKEN、GITHUB_REPO

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 即可开始开发。

---

## 项目结构

```
douyin-auto-fire-web/
├── src/
│   ├── app/
│   │   ├── page.js                  # 登录页
│   │   ├── layout.js                # 根布局
│   │   ├── globals.css              # 全局样式
│   │   ├── dashboard/
│   │   │   └── page.js              # 仪表盘（概览/Cookie/Config）
│   │   └── api/
│   │       ├── auth/route.js        # 登录验证 API
│   │       └── secrets/route.js     # Secrets 读写 API
│   ├── components/
│   │   ├── SecretCard.js            # Secret 状态卡片
│   │   ├── CookieEditor.js          # Cookie 编辑组件
│   │   └── ConfigEditor.js          # Config 表单编辑组件
│   └── lib/
│       ├── auth.js                  # 认证逻辑
│       └── github.js                # GitHub API 加密/更新
├── .env.example                     # 环境变量模板
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── vercel.json
```

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Next.js 14](https://nextjs.org) (App Router) |
| UI | [Tailwind CSS](https://tailwindcss.com) |
| 部署 | [Vercel](https://vercel.com) |
| 加密 | [tweetsodium](https://www.npmjs.com/package/tweetsodium) (GitHub Secrets 加密) |
| API | GitHub REST API |

---

## 与 douyin-auto-fire 的关系

| 项目 | 职责 | 运行方式 |
|------|------|----------|
| [douyin-auto-fire](https://github.com/asta0511/douyin-auto-fire) | 自动向抖音好友发送消息 | GitHub Actions 定时运行 |
| douyin-auto-fire-web（本仓库） | 管理 douyin-auto-fire 的配置 | Vercel 持续服务 |

两个项目独立部署，通过 GitHub Secrets 进行数据交换。在 Web 面板上修改配置后，下次 GitHub Actions 运行时会自动读取新配置。

---

## 常见问题

### 登录后提示密码错误

检查 Vercel 环境变量 `PASSWORD` 是否设置正确。由于 Vercel 的 Secret 类型变量保存后无法查看原值，建议重新设置确保正确。

### 保存 Config 后运行报错 "friends 必须是非空数组"

保存前请确保好友列表不为空。可以通过导入已有的 config.json 文件，或者在表单中手动添加好友。

### 自定义域名下无法正常登录

确保 Vercel 项目已正确配置域名，且 SSL 证书已签发（Vercel 自动处理）。部署后等待 1-2 分钟再访问。

### 修改配置后多久生效？

配置保存到 GitHub Secrets 后，下次 GitHub Actions 运行时自动生效。如果设置了定时任务，会在下一个定时时间触发。

---

## License

[MIT](LICENSE)