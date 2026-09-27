# 调机助手（Recovery Assistant）

复机助手的聊天基础设施：Vue 3 SPA、NestJS API、Mastra Agent 与 PostgreSQL Memory、Vercel AI SDK UI-message SSE。

## Structure

- `frontend/`: 当前 Vue 3 + Vite 前端；`presets/` 集中管理 Vite 配置与生成类型，`src/pages/` 提供类型化文件路由。`/tasks` 是调机任务总览，`/` 是新对话，`/analysis-demo` 展示交接稿的演示分析，`/chat/:id` 使用真实会话 API。
- `backend/`: NestJS API，统一前缀为 `/api`；负责会话、投票和基于 Mastra Agent 的 DeepSeek 流式聊天。
- `shared/`: 本地 Node 类型包 `@recovery-assistant/shared`，导出 HTTP DTO、聊天、会话和 `R<T>` 响应类型；不得依赖 Nuxt、Nest、TypeORM 或 AI SDK。

会话标题保存在 `recovery_assistant.ra_chats`；消息历史和投票状态由 `@mastra/memory` + `@mastra/pg` 保存在 `recovery_assistant_mastra` schema。开发期的固定演示用户 ID 为 `demo_user`。

调机任务和量测图目前是前端演示数据：新建任务保存在浏览器本地，CD 图由 ECharts 绘制。演示分析页的量测、Recipe、日志与步骤摘要均未连接设备接口；从该页继续追问时，会把标明为演示的数据作为用户上下文传入真实聊天接口。

## Documents

- [项目交接与核心流程](doc/HANDOFF.md)
- [前端迁移状态](doc/MIGRATION_PLAN.md)
- [项目开发约定](AGENTS.md)

## Development

后端需要 `backend/.env` 中的 DeepSeek 与 PostgreSQL 配置；不要提交该文件。开发环境启动时由 TypeORM 同步 `ra_chats` 表，Mastra 初始化自己的存储表。

```powershell
cd backend
pnpm start:dev
```

```powershell
cd frontend
pnpm dev -- --port 5173
```

前端通过 `VITE_API_BASE_URL` 连接后端；本地默认值为 `http://localhost:3001/api`。

除 `POST /api/ai/chat` 的 AI SDK SSE 外，所有 API 仅使用 `GET` 或 `POST`，并返回 `R<T>`：

```json
{ "code": 0, "data": {}, "msg": "success" }
```

后端使用 `R.success().data(value)` 构造成功响应；`code === 0` 表示成功。前端仅在 `frontend/src/api/use-api.ts` 解包该响应。

前后端统一使用 Node 风格的类型导入：

```ts
import type { Chat, R } from '@recovery-assistant/shared';
```

## Validation

```powershell
cd backend
pnpm run build
cd ..\frontend
pnpm typecheck
pnpm build
```
