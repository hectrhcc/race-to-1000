import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEGENDS = [
  { id: 'pele', page: 'Pelé' },
  { id: 'romario', page: 'Romário' },
  { id: 'puskas', page: 'Ferenc_Puskás' },
  { id: 'gerdmuller', page: 'Gerd_Müller' },
  { id: 'eusebio', page: 'Eusébio' },
  { id: 'distefano', page: 'Alfredo_Di_Stéfano' },
];

const OUTPUT_DIR = path.resolve('public/images/legends');
const USER_AGENT = 'RaceTo1000/1.0 (image-fetcher)';

async function getWikipediaImage(pageTitle) {
  const apiUrl = 'https://en.wikipedia.org/w/api.php';
  const params = {
    action: 'query',
    prop: 'pageimages',
    titles: pageTitle,
    format: 'json',
    pithumbsize: 400,
  };

  const { data } = await axios.get(apiUrl, { params, headers: { 'User-Agent': USER_AGENT } });
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];

  if (pageId === '-1') {
    console.error(`  Page not found: ${pageTitle}`);
    return null;
  }

  const page = pages[pageId];
  if (!page.thumbnail || !page.thumbnail.source) {
    console.error(`  No thumbnail found for: ${pageTitle}`);
    return null;
  }

  return page.thumbnail.source;
}

async function downloadImage(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    headers: { 'User-Agent': USER_AGENT },
  });

  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const legend of LEGENDS) {
    const filepath = path.join(OUTPUT_DIR, `${legend.id}.jpg`);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`✓ Already exists: ${legend.id}.jpg`);
      continue;
    }

    console.log(`Fetching image for: ${legend.page}...`);
    const imageUrl = await getWikipediaImage(legend.page);

    if (!imageUrl) {
      console.error(`  ✗ Could not get image URL for ${legend.page}`);
      continue;
    }

    console.log(`  Downloading: ${imageUrl}`);
    try {
      await downloadImage(imageUrl, filepath);
      console.log(`  ✓ Saved: ${legend.id}.jpg`);
    } catch (err) {
      console.error(`  ✗ Failed to download: ${err.message}`);
    }
  }
}

main().catch(console.error);
