const fs = require('node:fs/promises');
const path = require('node:path');
const Parser = require('rss-parser');

const rootDir = path.resolve(__dirname, '..');
const sourcesPath = path.join(__dirname, 'rss-sources.json');
const outputPath = path.join(rootDir, 'src', 'assets', 'data.json');
const maxItemsPerSource = 20;
const maxItemsPerCategory = 10;

const parser = new Parser({
  timeout: 15000,
  requestOptions: {
    headers: {
      'user-agent': 'SiteFluxRssBot/1.0 (+https://github.com/)'
    }
  }
});

function pickSummary(item) {
  return item.contentSnippet || item.content || item.summary || item.description || '';
}

function pickDate(item) {
  const raw = item.isoDate || item.pubDate || item.published || item.updated;
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldSkipItem(source, itemTitle) {
  return source.pillar === 'os-hardware' && /windows 11 insider preview/i.test(itemTitle);
}

async function main() {
  const sourcesRaw = await fs.readFile(sourcesPath, 'utf8');
  const sources = JSON.parse(sourcesRaw);

  const errors = [];
  const items = [];
  const seenTitles = new Set();

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const feedItems = (feed.items || []).slice(0, maxItemsPerSource);

      for (const item of feedItems) {
        const title = item.title || 'Sans titre';

        if (shouldSkipItem(source, title)) {
          continue;
        }

        const normalizedTitle = normalizeTitle(title);
        if (seenTitles.has(normalizedTitle)) {
          continue;
        }

        seenTitles.add(normalizedTitle);

        items.push({
          pillar: source.pillar,
          pillarLabel: source.pillarLabel,
          source: source.source,
          title,
          link: item.link || item.guid || source.url,
          publishedAt: pickDate(item),
          summary: pickSummary(item)
        });
      }
    } catch (error) {
      errors.push({
        source: source.source,
        url: source.url,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  items.sort((a, b) => {
    const left = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const right = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return right - left;
  });

  const categoryCounts = new Map();
  const limitedItems = [];

  for (const item of items) {
    const currentCount = categoryCounts.get(item.pillar) || 0;
    if (currentCount >= maxItemsPerCategory) {
      continue;
    }

    limitedItems.push(item);
    categoryCounts.set(item.pillar, currentCount + 1);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    total: limitedItems.length,
    sources: sources.length,
    errors,
    items: limitedItems
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  if (errors.length > 0) {
    console.warn(`RSS generated with ${errors.length} source error(s).`);
  }

  console.log(`Generated ${payload.total} item(s) from ${payload.sources} source(s).`);
}

main().catch((error) => {
  console.error('RSS generation failed:', error);
  process.exitCode = 1;
});