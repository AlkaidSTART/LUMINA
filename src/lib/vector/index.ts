import { env } from "@/lib/env";
import { PineconeStore } from "@/lib/vector/pinecone-store";
import { SupabaseVectorStore } from "@/lib/vector/supabase-store";
import type { VectorStore } from "@/lib/vector/types";

let store: VectorStore | undefined;

export function getVectorStore(): VectorStore {
  if (store) return store;

  store = env.VECTOR_STORE === "supabase" ? new SupabaseVectorStore() : new PineconeStore();
  return store;
}
