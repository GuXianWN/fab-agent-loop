# 项目交接

更新日期：2026-09-26（运行验证记录见下文）

## 当前结构

- `new-ui/` 是当前 Vue 3 + Vite 前端；旧 `web/` 已移除。
- `backend/` 是 NestJS API，统一前缀 `/api`。Agent 使用 Mastra，流式响应通过 `@mastra/ai-sdk` 转为 AI SDK v7 UI-message SSE。
- `shared/` 提供前后端共用的 HTTP DTO 与聊天类型。
- 演示用户固定为 `demo_user`，登录仍是进程内 Mock，不提供真实用户隔离。

## 核心流程与代码入口

1. 前端首页 `new-ui/src/pages/index.vue` 调用 `POST /api/chats` 创建会话，可同时保存首条用户消息，然后进入 `new-ui/src/pages/chat/[id].vue`。聊天页从 `GET /api/chats/:id` 恢复消息；只有一条用户消息时会自动发起生成。
2. 后续提问通过 AI SDK `useChat` 向 `POST /api/ai/chat` 提交当前一条用户消息。`backend/src/chats/chat-stream.service.ts` 校验会话归属并编排标题生成和流式响应；模型历史由 Mastra Memory 读取。
3. `backend/src/ai/recovery.agent.ts` 声明 DeepSeek Agent，`backend/src/ai/agent-messages.service.ts` 负责消息调用，最多执行 5 步，可调用 `get-current-time` 获取北京时间。Mastra Memory 按步骤保存用户、助手和工具消息，`@mastra/ai-sdk` 将流转换为 AI SDK v7 UI-message SSE；本轮没有进程中断后的自动续跑。
4. `backend/src/chats/` 负责聊天 API、流式编排、标题和消息业务；`backend/src/ai/` 提供 Agent、工具及集中配置 `model.config.ts`；`backend/src/database/chat-memory.service.ts` 封装 Mastra Memory。HTTP DTO 与聊天类型以 `shared/types/` 为准，前端普通 API 响应只在 `new-ui/src/api/use-api.ts` 解包。

## 数据与依赖

TypeORM 只维护 `recovery_assistant.ra_chats`（会话标题和列表）。消息、线程和消息 metadata 中的投票状态由 `@mastra/memory@1.30.0`、`@mastra/pg@1.25.0` 保存在独立的 `recovery_assistant_mastra` schema；旧的 `ra_users`、`ra_messages`、`ra_message_votes` 已移除。Mastra 依赖与 `@mastra/core@1.67.0` 同批发布，现有 `ai@7.0.108` 和 `@mastra/ai-sdk@1.10.3` 保持不变。

开发阶段不迁移旧会话数据。当前开发配置通过 TypeORM 的 `synchronize` 创建或同步 `ra_chats` 表；Mastra PostgreSQL adapter 启动时初始化自己的内部表。2026-09-23 的数据库重建与迁移验证属于下方的历史记录。

按当前约定，控制器不对路径 ID 使用 `ParseUUIDPipe`；非法会话 UUID 进入 PostgreSQL 查询时会返回 500。

## 本地运行

后端在 `backend/.env` 配置 `OPENAI_*` 和 `POSTGRES_*` 变量：

```powershell
cd backend
pnpm start:dev
```

```powershell
cd new-ui
pnpm dev -- --port 5173
```

前端默认连接 `http://localhost:3001/api`，可通过 `VITE_API_BASE_URL` 覆盖。除 `POST /api/ai/chat` 的 SSE 外，API 返回 `{ code, data, msg }`。

## 2026-09-23 的验证记录

- `backend`: `pnpm run build`、当时的 `pnpm migration:run` 通过；迁移命令现已移除，当前开发环境使用上文所述的 TypeORM `synchronize`。
- `new-ui`: `pnpm typecheck`、`pnpm build` 通过。
- 独立端口上的真实浏览器验证了创建对话、流式回复、多轮追问、刷新后恢复及页面渲染。

当时只验收这些基础对话行为，投票接口另做了点赞、取消、点踩的存取验证。更广泛的编辑、停止生成等交互尚未纳入该次验收。
