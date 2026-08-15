# Recovery Assistant

复机助手的聊天基础设施：Nuxt 4 静态 SPA、NestJS API、Vercel AI SDK UI-message SSE 和 PostgreSQL 会话历史。

## Structure

- `web/`: Nuxt 4 前端，必须保持 `ssr: false`；静态部署产物为 `web/.output/public`。
- `backend/`: NestJS API，统一前缀为 `/api`；负责会话、消息、投票、Demo User 会话和 DeepSeek 流式聊天。
- `shared/`: 本地 Node 类型包 `@recovery-assistant/shared`，导出 HTTP DTO、聊天、会话和 `R<T>` 响应类型；不得依赖 Nuxt、Nest、TypeORM 或 AI SDK。
- `chat-vue/`: 官方聊天模板参考，不参与构建或部署。
- `HANDOFF.md`: 当前实现状态、验证记录和后续任务。

## Development

后端需要 `backend/.env` 中的 DeepSeek 与 PostgreSQL 配置；不要提交该文件。

```powershell
cd backend
pnpm migration:run
pnpm start:dev
```

```powershell
cd web
pnpm dev -- --port 3000
```

前端通过 `NUXT_PUBLIC_API_BASE` 连接后端；本地默认值为 `http://localhost:3001/api`。

除 `POST /api/ai/chat` 的 AI SDK SSE 外，所有 API 仅使用 `GET` 或 `POST`，并返回 `R<T>`：

```json
{ "code": 0, "data": {}, "msg": "success" }
```

后端使用 `R.success().data(value)` 构造成功响应；`code === 0` 表示成功。前端仅在 `web/app/composables/use-api.ts` 解包该响应。

前后端统一使用 Node 风格的类型导入：

```ts
import type { Chat, R } from '@recovery-assistant/shared';
```

## Validation

```powershell
cd backend
pnpm run build

cd web
pnpm typecheck
pnpm generate
```
