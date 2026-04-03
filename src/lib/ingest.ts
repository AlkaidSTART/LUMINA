import { chunkText } from "@/lib/chunk";
import { crawlWebsite } from "@/lib/crawl";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getVectorStore } from "@/lib/vector";

export async function ingestUrl(url: string, maxPages = env.CRAWL_MAX_PAGES) {
  const pages = await crawlWebsite(url, maxPages);
  const vectorStore = getVectorStore();

  let chunkCount = 0;

  for (const page of pages) {
    const document = await prisma.sourceDocument.upsert({
      where: { url: page.url },
      update: {
        title: page.title,
        content: page.content,
      },
      create: {
        url: page.url,
        title: page.title,
        content: page.content,
      },
    });

    await prisma.documentChunk.deleteMany({
      where: { documentId: document.id },
    });

    const chunks = chunkText(page.content);
    const records: { id: string; content: string; metadata: Record<string, unknown> }[] = [];

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = await prisma.documentChunk.create({
        data: {
          documentId: document.id,
          chunkIndex: index,
          content: chunks[index],
        },
      });

      records.push({
        id: chunk.id,
        content: chunk.content,
        metadata: {
          documentId: document.id,
          url: document.url,
          title: document.title,
          chunkIndex: chunk.chunkIndex,
        },
      });
    }

    await vectorStore.upsert(records);
    chunkCount += records.length;
  }

  return {
    pages: pages.length,
    chunks: chunkCount,
  };
}

export async function searchKnowledge(query: string, topK = 5) {
  const vectorStore = getVectorStore();
  return vectorStore.search(query, topK);
}
