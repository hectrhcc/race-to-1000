import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersPath = path.join(__dirname, '../src/data/players.json');
const imagesDir = path.join(__dirname, '../public/images/players');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const wikiTitles = {
  "ronaldo": "Cristiano_Ronaldo",
  "messi": "Lionel_Messi",
  "lewandowski": "Robert_Lewandowski",
  "kane": "Harry_Kane",
  "neymar": "Neymar",
  "salah": "Mohamed_Salah",
  "benzema": "Karim_Benzema",
  "mbappe": "Kylian_Mbappé",
  "griezmann": "Antoine_Griezmann",
  "mane": "Sadio_Mané",
  "lukaku": "Romelu_Lukaku",
  "haaland": "Erling_Haaland",
  "son": "Son_Heung-min",
  "dybala": "Paulo_Dybala",
  "vinicius": "Vinícius_Júnior",
  "lautaro": "Lautaro_Martínez",
  "brunofernandes": "Bruno_Fernandes_(futbolista_nacido_en_1994)",
  "watkins": "Ollie_Watkins",
  "rashford": "Marcus_Rashford",
  "saka": "Bukayo_Saka"
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RaceTo1000/1.0 (https://github.com/hectrhcc/race-to-1000; bot@goat-counter.vercel.app)'
    }
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

async function run() {
  for (const player of players) {
    const title = wikiTitles[player.id];
    if (!title) {
      console.log(`Skipping ${player.name}, no title mapped.`);
      continue;
    }

    try {
      console.log(`Fetching API for ${player.name}...`);
      const apiRes = await fetch(`https://es.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400`, {
        headers: { 'User-Agent': 'RaceTo1000/1.0 (https://github.com/hectrhcc/race-to-1000; bot@goat-counter.vercel.app)' }
      });
      const data = await apiRes.json();
      
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      if (page.thumbnail && page.thumbnail.source) {
        const thumbUrl = page.thumbnail.source;
        const ext = '.jpg';
        const filename = `${player.id}${ext}`;
        const dest = path.join(imagesDir, filename);

        console.log(`Downloading image from ${thumbUrl}...`);
        await downloadImage(thumbUrl, dest);
        
        player.image = `/images/players/${filename}`;
        console.log(`Success: Saved to ${player.image}`);
      } else {
        console.log(`No image found for ${player.name} in Wikipedia API.`);
        // Fallback to ui-avatars locally
        player.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=200&background=27272a&color=f4f4f5&bold=true&format=svg`;
      }
    } catch (err) {
      console.error(`Error processing ${player.name}:`, err.message);
    }
    
    // Polite delay
    await delay(1500);
  }

  fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
  console.log('Finished updating players.json and downloading images.');
}

run();
