"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function Home() {
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingestStatus, setIngestStatus] = useState<string>("");
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();

  const onIngest = async (event: React.FormEvent) => {
    event.preventDefault();
    setIngestStatus("Ingesting...");

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ingestUrl }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "Failed to ingest URL");
      }

      const result = await response.json();
      setIngestStatus(`Done. Pages: ${result.pages}, Chunks: ${result.chunks}`);
    } catch (err) {
      setIngestStatus(err instanceof Error ? err.message : "Failed to ingest URL");
    }
  };

  const onSend = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      <section className="rounded-xl border border-zinc-200 p-5">
        <h1 className="text-2xl font-semibold">Lumina AI Stack Starter</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Next.js App Router + Vercel AI SDK + Crawlee + Prisma + Vector Search
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-semibold">1) Ingest Website</h2>
        <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={onIngest}>
          <input
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            placeholder="https://example.com"
            value={ingestUrl}
            onChange={(e) => setIngestUrl(e.target.value)}
            required
          />
          <button className="rounded-md bg-zinc-900 px-4 py-2 text-white" type="submit">
            Ingest
          </button>
        </form>
        {ingestStatus ? <p className="mt-2 text-sm text-zinc-700">{ingestStatus}</p> : null}
      </section>

      <section className="flex min-h-[320px] flex-1 flex-col rounded-xl border border-zinc-200 p-5">
        <h2 className="text-lg font-semibold">2) Chat</h2>
        <div className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-md bg-zinc-50 p-3">
          {messages.map((message) => (
            <div key={message.id} className="rounded-md border border-zinc-200 bg-white p-3">
              <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">{message.role}</p>
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <p key={`${message.id}-${index}`} className="whitespace-pre-wrap text-sm">
                      {part.text}
                    </p>
                  );
                }

                return null;
              })}
            </div>
          ))}
        </div>

        <form className="mt-3 flex gap-2" onSubmit={onSend}>
          <input
            className="w-full rounded-md border border-zinc-300 px-3 py-2"
            placeholder="Ask something about your ingested content..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "ready"}
          />
          <button
            className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50"
            type="submit"
            disabled={status !== "ready"}
          >
            Send
          </button>
        </form>

        {error ? <p className="mt-2 text-sm text-red-600">{error.message}</p> : null}
      </section>
    </main>
  );
}
