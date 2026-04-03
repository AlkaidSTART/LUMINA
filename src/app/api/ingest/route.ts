import { z } from "zod";
import { ingestUrl } from "@/lib/ingest";

const ingestSchema = z.object({
  url: z.string().url(),
  maxPages: z.number().int().positive().max(50).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const { url, maxPages } = ingestSchema.parse(body);

  const result = await ingestUrl(url, maxPages);
  return Response.json(result);
}
