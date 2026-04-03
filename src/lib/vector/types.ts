export type SearchResult = {
  id: string;
  score: number;
  content: string;
  documentId?: string;
};

export type VectorDocument = {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export interface VectorStore {
  upsert(documents: VectorDocument[]): Promise<void>;
  search(query: string, topK?: number): Promise<SearchResult[]>;
}
