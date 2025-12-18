# 中医AI助手

基于 Next.js 和 AI SDK 构建的中医领域 AI 聊天助手，支持多种 LLM 提供商。

## 快速部署

### 1. 准备配置文件

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 必填：生成密钥 openssl rand -base64 32
AUTH_SECRET=your-secret-key

# 必填：管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```

### 2. 启动服务

```bash
docker compose up -d
```

### 3. 配置 AI 模型

1. 访问 `http://localhost:3000/admin-login`
2. 使用管理员账号登录
3. 添加 AI Provider（支持 OpenAI、OpenRouter 等兼容接口）
4. 保存配置

完成！访问 `http://localhost:3000` 开始使用。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

## 数据存储

| 数据类型 | 存储位置 |
|---------|---------|
| 聊天记录 | 浏览器 localStorage |
| 上传文件 | 服务器 `/data/uploads` |
| 系统配置 | 服务器 `/data/config.json` |

## 技术栈

- **框架**: Next.js 16 (App Router)
- **AI**: Vercel AI SDK
- **样式**: Tailwind CSS + shadcn/ui
