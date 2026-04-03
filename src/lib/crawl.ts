import { PlaywrightCrawler } from "@crawlee/playwright";
import { RequestQueue } from "@crawlee/core";

export type CrawledPage = {
  url: string;
  title: string;
  content: string;
};

export async function crawlWebsite(startUrl: string, maxPages = 5): Promise<CrawledPage[]> {
  const pages: CrawledPage[] = [];
  const origin = new URL(startUrl).origin;
  const requestQueue = await RequestQueue.open();

  await requestQueue.addRequest({ url: startUrl });

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxRequestsPerCrawl: maxPages,
    async requestHandler({ request, page, enqueueLinks }) {
      await page.waitForLoadState("domcontentloaded");
      const title = await page.title();
      const content = (await page.locator("body").innerText()).trim();

      if (content.length > 0) {
        pages.push({ url: request.loadedUrl ?? request.url, title, content });
      }

      await enqueueLinks({
        globs: [`${origin}/**`],
        strategy: "same-domain",
      });
    },
  });

  await crawler.run();
  return pages;
}
