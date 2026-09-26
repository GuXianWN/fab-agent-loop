# 项目交接

更新日期：2026-09-26（运行验证记录见下文）

## 当前结构

- `new-ui/` 是当前 Vue 3 + Vite 前端；旧 `web/` 已移除。
- `backend/` 是 NestJS API，统一前缀 `/api`。Agent 使用 Mastra，流式响应通过 `@mastra/ai-sdk` 转为 AI SDK v7 UI-message SSE。
- `shared/` 提供前后端共用的 HTTP DTO 与聊天类型。
- 演示用户固定为 `demo_user`，登录仍是进程内 Mock，不提供真实用户隔离。

## 核心流程与代码入口

1. 前端首页 `new-ui/src/pages/index.vue` 调用 `POST /api/chats` 创建会话，可同时保存首条用户消息，然后进入 `new-ui/src/pages/chat/[id].vue`。聊天页从 `GET /api/chats/:id` 恢复消息；只有一条用户消息时会自动发起生成。
2. 后续提问通过 AI SDK `useChat` 发送到 `POST /api/ai/chat`。`backend/src/ai/chat-stream.service.ts` 保存本次新增的用户消息，并从数据库读取会话历史作为模型上下文；客户端传来的完整消息列表不是上下文来源。
3. `backend/src/ai/recovery.agent.ts` 调用 DeepSeek，`@mastra/ai-sdk` 将结果转换为 AI SDK v7 UI-message SSE。流正常完成且回复有内容时，后端保存助手消息，并在标题为空时保存生成的标题。中止的回复不会作为完整助手消息保存。
4. `backend/src/chats/chats.service.ts` 管理会话、消息删除和投票；`backend/src/database/chat-memory.service.ts` 封装 Mastra Memory。HTTP DTO 与聊天类型以 `shared/types/` 为准，前端普通 API 响应只在 `new-ui/src/api/use-api.ts` 解包。

## 数据与依赖

TypeORM 只维护 `recovery_assistant.ra_chats`（会话标题和列表）。消息、线程和消息 metadata 中的投票状态由 `@mastra/memory@1.30.0`、`@mastra/pg@1.25.0` 保存在独立的 `recovery_assistant_mastra` schema；旧的 `ra_users`、`ra_messages`、`ra_message_votes` 已移除。Mastra 依赖与 `@mastra/core@1.67.0` 同批发布，现有 `ai@7.0.108` 和 `@mastra/ai-sdk@1.10.3` 保持不变。

开发阶段不迁移旧会话数据。当前迁移文件描述全新数据库结构；截至 2026-09-23，本地数据库已按该结构重建。Mastra PostgreSQL adapter 启动时初始化它自己的内部表。

按当前约定，控制器不对路径 ID 使用 `ParseUUIDPipe`；非法会话 UUID 进入 PostgreSQL 查询时会返回 500。

## 本地运行

后端在 `backend/.env` 配置 `OPENAI_*` 和 `POSTGRES_*` 变量，先运行迁移：

```powershell
cd backend
pnpm migration:run
pnpm start:dev
```

```powershell
cd new-ui
pnpm dev -- --port 5173
```

前端默认连接 `http://localhost:3001/api`，可通过 `VITE_API_BASE_URL` 覆盖。除 `POST /api/ai/chat` 的 SSE 外，API 返回 `{ code, data, msg }`。

## 2026-09-23 的验证记录

- `backend`: `pnpm run build`、`pnpm migration:run` 通过。
- `new-ui`: `pnpm typecheck`、`pnpm build` 通过。
- 独立端口上的真实浏览器验证了创建对话、流式回复、多轮追问、刷新后恢复及页面渲染。

当时只验收这些基础对话行为，投票接口另做了点赞、取消、点踩的存取验证。更广泛的编辑、停止生成等交互尚未纳入该次验收。
