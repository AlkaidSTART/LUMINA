import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, tool } from "ai";
import { z } from "zod";
import { env } from "@/lib/env";
import { searchKnowledge } from "@/lib/ingest";

const requestSchema = z.object({
  messages: z.array(z.any()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const { messages } = requestSchema.parse(body);

  const result = streamText({
    model: openai(env.MODEL_NAME),
    messages: await convertToModelMessages(messages),
    tools: {
      searchKnowledge: tool({
        description: "Searches the knowledge base for relevant chunks.",
        inputSchema: z.object({
          query: z.string().min(1),
          topK: z.number().int().min(1).max(10).default(5),
        }),
        execute: async ({ query, topK }) => {
          return searchKnowledge(query, topK);
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
