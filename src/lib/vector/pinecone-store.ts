import { Pinecone } from "@pinecone-database/pinecone";
import { embedText, embedTexts } from "@/lib/ai";
import { env } from "@/lib/env";
import type { SearchResult, VectorDocument, VectorStore } from "@/lib/vector/types";

export class PineconeStore implements VectorStore {
  private readonly index;

  constructor() {
    if (!env.PINECONE_API_KEY || !env.PINECONE_INDEX) {
      throw new Error("Pinecone is not configured. Set PINECONE_API_KEY and PINECONE_INDEX.");
    }

    const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
    this.index = pinecone.index(env.PINECONE_INDEX).namespace(env.PINECONE_NAMESPACE);
  }

  async upsert(documents: VectorDocument[]) {
    if (documents.length === 0) return;

    const embeddings = await embedTexts(documents.map((doc) => doc.content));
    const records = documents.map((doc, idx) => ({
      id: doc.id,
      values: embeddings[idx],
      metadata: {
        content: doc.content,
        ...(doc.metadata ?? {}),
      },
    }));

    await this.index.upsert({ records });
  }

  async search(query: string, topK = 5): Promise<SearchResult[]> {
    const queryEmbedding = await embedText(query);

    const result = await this.index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return (result.matches ?? []).map((match) => ({
      id: match.id,
      score: match.score ?? 0,
      content: String(match.metadata?.content ?? ""),
      documentId: match.metadata?.documentId ? String(match.metadata.documentId) : undefined,
    }));
  }
}
