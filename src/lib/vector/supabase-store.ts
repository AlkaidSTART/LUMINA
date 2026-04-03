import { createClient } from "@supabase/supabase-js";
import { embedText, embedTexts } from "@/lib/ai";
import { env } from "@/lib/env";
import type { SearchResult, VectorDocument, VectorStore } from "@/lib/vector/types";

type MatchRow = {
  id: string;
  content: string;
  score: number;
  document_id?: string | null;
};

export class SupabaseVectorStore implements VectorStore {
  private readonly client;

  constructor() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }

    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }

  async upsert(documents: VectorDocument[]) {
    if (documents.length === 0) return;

    const embeddings = await embedTexts(documents.map((doc) => doc.content));

    const rows = documents.map((doc, idx) => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata ?? {},
      embedding: embeddings[idx],
    }));

    const { error } = await this.client.from(env.SUPABASE_VECTOR_TABLE).upsert(rows);
    if (error) throw error;
  }

  async search(query: string, topK = 5): Promise<SearchResult[]> {
    const queryEmbedding = await embedText(query);

    const { data, error } = await this.client.rpc(env.SUPABASE_MATCH_RPC, {
      query_embedding: queryEmbedding,
      match_count: topK,
    });

    if (error) throw error;

    return ((data ?? []) as MatchRow[]).map((row) => ({
      id: row.id,
      score: row.score,
      content: row.content,
      documentId: row.document_id ?? undefined,
    }));
  }
}
