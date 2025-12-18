# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 16、Vercel AI SDK 和 Neon Serverless Postgres 构建的 AI 聊天机器人。使用 Vercel AI Gateway 统一访问多个 LLM 提供商（Anthropic、OpenAI、Google、xAI）。

## 常用命令

```bash
pnpm dev                    # 启动开发服务器（使用 Turbopack）
pnpm build                  # 运行迁移并构建生产版本
pnpm lint                   # 使用 Ultracite（基于 Biome）检查代码
pnpm format                 # 自动修复 lint/格式问题

# 数据库（Drizzle ORM + Postgres）
pnpm db:generate            # 从 schema 变更生成迁移文件
pnpm db:migrate             # 应用待处理的迁移
pnpm db:studio              # 打开 Drizzle Studio 图形界面
pnpm db:push                # 直接推送 schema（不生成迁移文件）

# 测试（Playwright）
pnpm test                   # 运行所有 e2e 测试
pnpm exec playwright test tests/e2e/chat.test.ts    # 运行单个测试文件
pnpm exec playwright test --ui                      # 交互式测试运行器
```

## 架构

### 应用结构（Next.js App Router）
- `app/(auth)/` - 认证相关路由和逻辑，使用 Auth.js
- `app/(chat)/` - 主聊天界面和 API 路由
- `app/(chat)/api/chat/route.ts` - 主要的聊天流式端点，使用 AI SDK 的 `streamText`

### 核心目录
- `lib/ai/` - AI 配置：模型定义、提示词、提供商和工具
- `lib/db/` - 数据库 schema（`schema.ts`）、查询和迁移（Drizzle ORM）
- `components/` - React 组件，`ui/` 目录包含 shadcn/ui 基础组件
- `artifacts/` - 处理聊天中的文档/代码产物生成

### AI 系统
- **提供商抽象**: `lib/ai/providers.ts` 封装 Vercel AI Gateway
- **模型**: 在 `lib/ai/models.ts` 中配置，支持推理模型（extended thinking）
- **工具**: 位于 `lib/ai/tools/` - createDocument、updateDocument、getWeather、requestSuggestions
- **提示词**: `lib/ai/prompts.ts` 中的系统提示词根据模型能力有所不同

### 数据库 Schema（`lib/db/schema.ts`）
主要表：User、Chat、Message_v2（当前版本）、Document、Suggestion、Vote_v2、Stream
- 消息使用 `parts` JSON 字段存储多部分内容
- 文档支持类型：text、code、image、sheet

### 测试
- E2E 测试位于 `tests/e2e/`，使用 Playwright
- 测试用 AI 模型 mock 在 `lib/ai/models.mock.ts`
- 页面对象位于 `tests/pages/`

## 代码风格（Ultracite/Biome）

本项目使用 Ultracite（基于 Biome）。关键规则：
- 禁用 TypeScript enum - 使用 `as const` 的常量对象
- 禁用 `any` 类型 - 使用正确的类型定义
- 类型导入使用 `import type`
- 使用 `for...of` 而非 `Array.forEach`
- 使用箭头函数而非函数表达式
- 生产代码禁用 console.log
- 无障碍性：按钮需要 `type` 属性，图片需要 alt 文本

## 环境变量

必需变量定义在 `.env.example` 中。使用 `vercel env pull` 从 Vercel 同步，或手动创建 `.env.local`。关键变量：
- `POSTGRES_URL` - Neon 数据库连接
- `AUTH_SECRET` - Auth.js 密钥
- `AI_GATEWAY_API_KEY` - 非 Vercel 部署时必需
