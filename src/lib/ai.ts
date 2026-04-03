import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { env } from "@/lib/env";

const provider = openai;

export function chatModel() {
  return provider(env.MODEL_NAME);
}

export async function embedText(value: string) {
  const result = await embed({
    model: provider.embedding(env.EMBEDDING_MODEL),
    value,
  });

  return result.embedding;
}

export async function embedTexts(values: string[]) {
  if (values.length === 0) return [];

  const result = await embedMany({
    model: provider.embedding(env.EMBEDDING_MODEL),
    values,
  });

  return result.embeddings;
}
