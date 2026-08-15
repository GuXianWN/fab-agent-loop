# 项目交接文档

更新日期：2026-08-15

## 当前状态

项目已从 Vite/Vue 模板迁移为 Nuxt 4 静态 SPA，并完成 NestJS 聊天 API、Vercel AI SDK UI-message SSE 与 PostgreSQL 持久化的第一版接入。`chat-vue/` 只保留为视觉和交互参考，不参与构建。

- 前端入口为 `web/`，路由为 `/` 和 `/chat/:id`；构建产物是 `web/.output/public`。
- 后端入口为 `backend/`，全局 API 前缀为 `/api`，允许全部跨域。
- 当前实际模型由 `backend/.env` 的 `OPENAI_*` 配置决定；示例配置为 `https://api.deepseek.com` 与 `deepseek-v4-flash`。后端使用 `@ai-sdk/deepseek` 的 Chat Completions provider，并显式启用 `thinking`，从 `reasoning_content` 流式恢复可展示的 reasoning parts。前端仅展示同一个固定模型，不提供模型管理。
- 会话数据已改为 PostgreSQL 存储；登录仍是进程内 `Demo User` Mock，固定用户 ID 为 `00000000-0000-4000-8000-000000000001`。

## 已实现功能

- Nuxt UI 聊天首页、侧栏会话分组与搜索、深浅色、登录 Mock、重命名、删除、分享可见性、投票、复制、编辑、重新生成和停止生成。
- `POST /api/ai/chat` 使用 Vercel AI SDK UI-message SSE。后端保存最新用户消息，基于完整历史请求模型，并在流完成后保存助手消息。
- `GET/POST/PATCH/DELETE /api/chats`、`GET /api/chats/:id`、投票与消息删除接口，以及 `GET /api/session`、登录、退出接口。
- TypeORM 实体与迁移：`recovery_assistant` schema 下的 `ra_users`、`ra_chats`、`ra_messages`、`ra_message_votes`。所有表均含创建/修改人和时间、逻辑删除字段；刻意未建立外键。会话更新时间和投票查询所需索引已建立。
- 编辑消息会删除该消息之后的整个历史分支；重新生成只替换目标助手消息。流式生成未完成时，输入框仍可输入，但所有消息提交、编辑保存与重新生成都会被前端状态守卫拒绝，唯一允许的消息流操作是停止生成。

## 运行与数据库

```powershell
cd backend
pnpm migration:run
pnpm start:dev

cd web
pnpm dev -- --port 5173
```

后端启动前需在 `backend/.env` 填写 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL` 及 `POSTGRES_HOST`、`POSTGRES_PORT`、`POSTGRES_USER`、`POSTGRES_PASSWORD`、`POSTGRES_DATABASE`。不要提交该文件。迁移关闭了 `synchronize`，必须先运行迁移；数据源会输出 SQL query/error 日志。

## 已验证

2026-08-15 已完成本地浏览器回归与命令验证：

- `cd web; pnpm typecheck`
- `cd backend; pnpm run build`
- 浏览器已验证：创建首条消息、DeepSeek reasoning 流、追问、刷新恢复、编辑、重新生成、投票、重命名、搜索、分享、删除、已删除会话 404、深浅色和移动端布局。

未在本次交接中验证远程数据库迁移；停止生成与浏览器剪贴板读回受自动化时序/权限限制，部署前应在真实浏览器中再次覆盖这两项。

## 后续优先级

1. 在根目录新建 `shared/`，提取前后端通用的 API DTO、会话和聊天类型；将 `web/app/types/` 中可共享类型迁移过去，并避免让 shared 依赖 Nuxt、Nest 或 TypeORM。
2. 在目标 PostgreSQL 上执行迁移并进行浏览器端完整回归，确认 SSE 流及历史消息落库。
3. 对照官方 `chat-vue` demo 继续修正颜色、间距、响应式侧栏和消息状态；DevTools 覆盖层不计入视觉比较。
4. 在聊天底座稳定后再引入复机业务、真实认证和权限；不要绕过现有聊天消息协议。

## 注意事项

- 工作区有大量未提交的迁移改动和 `chat-vue/` 参考目录；提交前按功能拆分，勿混入生成产物或真实密钥。
- `web/app/composables/use-api.ts` 是前端唯一 HTTP 边界。新增接口必须从这里暴露。
- 后端按特性目录组织；控制器仅负责 HTTP，业务和数据库操作放入 service。
