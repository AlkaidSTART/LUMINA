import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  MODEL_NAME: z.string().default("gpt-4o-mini"),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  VECTOR_STORE: z.enum(["pinecone", "supabase"]).default("pinecone"),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
  PINECONE_NAMESPACE: z.string().default("default"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_VECTOR_TABLE: z.string().default("document_chunks"),
  SUPABASE_MATCH_RPC: z.string().default("match_document_chunks"),
  CRAWL_MAX_PAGES: z.coerce.number().int().positive().default(5),
});

export const env = envSchema.parse(process.env);
