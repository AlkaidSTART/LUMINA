import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina AI Stack Starter",
  description: "Next.js + Vercel AI SDK + Crawlee + Prisma + Vector Search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
