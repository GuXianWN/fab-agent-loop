# 项目交接

更新日期：2026-09-23

## 当前结构

- `new-ui/` 是当前 Vue 3 + Vite 前端；旧 `web/` 已移除。
- `backend/` 是 NestJS API，统一前缀 `/api`。Agent 使用 Mastra，流式响应通过 `@mastra/ai-sdk` 转为 AI SDK v7 UI-message SSE。
- `shared/` 提供前后端共用的 HTTP DTO 与聊天类型。
- 演示用户固定为 `demo_user`，登录仍是进程内 Mock，不提供真实用户隔离。

## 数据与依赖

TypeORM 只维护 `recovery_assistant.ra_chats`（会话标题和列表）。消息、线程和消息 metadata 中的投票状态由 `@mastra/memory@1.30.0`、`@mastra/pg@1.25.0` 保存在独立的 `recovery_assistant_mastra` schema；旧的 `ra_users`、`ra_messages`、`ra_message_votes` 已移除。Mastra 依赖与 `@mastra/core@1.67.0` 同批发布，现有 `ai@7.0.108` 和 `@mastra/ai-sdk@1.10.3` 保持不变。

开发阶段不迁移旧会话数据。当前迁移文件描述全新数据库结构；本地数据库已经按该结构重建。Mastra PostgreSQL adapter 启动时初始化它自己的内部表。

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

## 本次验证

- `backend`: `pnpm run build`、`pnpm migration:run` 通过。
- `new-ui`: `pnpm typecheck`、`pnpm build` 通过。
- 独立端口上的真实浏览器验证了创建对话、流式回复、多轮追问、刷新后恢复及页面渲染。

当前只要求这些基础对话行为，投票接口另做了点赞、取消、点踩的存取验证。更广泛的编辑、停止生成等交互尚未纳入本次验收。
