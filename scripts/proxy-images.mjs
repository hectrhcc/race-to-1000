import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const playersPath = path.join(__dirname, '../src/data/players.json');
const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

for (const player of players) {
  if (player.image && player.image.startsWith('https://upload.wikimedia.org')) {
    // Remove the https:// prefix
    const rawUrl = player.image.replace('https://', '');
    // Wrap with images.weserv.nl proxy
    player.image = `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}&w=400&h=400&fit=cover&mask=circle`;
  }
}

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
console.log('Updated players.json with weserv proxy URLs.');
