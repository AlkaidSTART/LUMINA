# Lumina Starter

基于你给的技术栈初始化完成：

- Next.js (App Router, TypeScript)
- Vercel AI SDK
- Crawlee + Playwright
- Prisma + PostgreSQL
- Vector Store 可选 Pinecone / Supabase Vector

## 1. 安装与环境变量

```bash
pnpm install
cp .env.example .env
```

填充 `.env` 里的关键字段：

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `VECTOR_STORE` (`pinecone` 或 `supabase`)
- Pinecone 或 Supabase 对应凭证

## 2. 初始化数据库

```bash
pnpm db:generate
pnpm db:migrate
```

## 3. 启动开发

```bash
pnpm dev
```

打开 `http://localhost:3000`。

页面里有两个区域：

1. **Ingest Website**：输入 URL 后调用 `/api/ingest` 进行抓取、分块、入库、向量化。
2. **Chat**：调用 `/api/chat`，模型可通过 tool 调用 `searchKnowledge` 从向量库召回内容。

## 项目结构

- `src/app/api/chat/route.ts`：AI 聊天与 tool calling
- `src/app/api/ingest/route.ts`：网页抓取与入库入口
- `src/lib/crawl.ts`：Crawlee + Playwright 抓取实现
- `src/lib/ingest.ts`：抓取、切块、Prisma 入库、向量 upsert
- `src/lib/vector/`：Pinecone / Supabase 向量存储适配层
- `prisma/schema.prisma`：`SourceDocument` + `DocumentChunk` 模型（含 pgvector 字段）

## 额外命令

```bash
pnpm crawl:sample https://example.com
pnpm lint
pnpm build
```

## Supabase Vector 说明

默认代码调用 RPC：`match_document_chunks`。你需要在 Supabase 侧创建对应表和匹配函数，并确保函数参数包含：

- `query_embedding`
- `match_count`

如果你已有不同命名，可通过 `.env` 修改：

- `SUPABASE_VECTOR_TABLE`
- `SUPABASE_MATCH_RPC`
