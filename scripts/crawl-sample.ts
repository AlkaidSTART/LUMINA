import { crawlWebsite } from "../src/lib/crawl";

async function main() {
  const url = process.argv[2];
  if (!url) {
    throw new Error("Usage: npm run crawl:sample -- <url>");
  }

  const pages = await crawlWebsite(url, 3);
  for (const page of pages) {
    console.log(`- ${page.url}`);
    console.log(`  title: ${page.title}`);
    console.log(`  chars: ${page.content.length}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
