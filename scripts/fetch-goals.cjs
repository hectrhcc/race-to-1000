const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Rutas a tus archivos de datos
const PLAYERS_JSON_PATH = path.resolve('src/data/players.json');
const HISTORY_JSON_PATH = path.resolve('src/data/history.json');

// Mapeo flexible de URLs de Wikipedia
const WIKIPEDIA_URLS = {
  cristiano: 'https://en.wikipedia.org/wiki/Cristiano_Ronaldo',
  messi: 'https://en.wikipedia.org/wiki/Lionel_Messi',
  kane: 'https://en.wikipedia.org/wiki/Harry_Kane',
  mbappe: 'https://en.wikipedia.org/wiki/Kylian_Mbapp%C3%A9',
  haaland: 'https://en.wikipedia.org/wiki/Erling_Haaland'
};

async function fetchGoalsFromWikipedia(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    let totalGoals = 0;

    $('.infobox-data-number').each((i, el) => {
      const text = $(el).text().trim();
      const match = text.match(/\((\d+)\)/);
      if (match) {
        totalGoals += parseInt(match[1], 10);
      }
    });

    return totalGoals;
  } catch (error) {
    console.error(`Error raspando la URL ${url}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    // 1. Validar y leer archivos de datos
    if (!fs.existsSync(PLAYERS_JSON_PATH)) {
      console.error(`Error: No se encontró el archivo en ${PLAYERS_JSON_PATH}`);
      process.exit(1);
    }

    let playersData = JSON.parse(fs.readFileSync(PLAYERS_JSON_PATH, 'utf-8'));
    const now = new Date().toISOString();

    if (Array.isArray(playersData)) {
        playersData.forEach(player => {
        player.lastChecked = now;
    });}
    let historyData = [];
    
    if (fs.existsSync(HISTORY_JSON_PATH)) {
      historyData = JSON.parse(fs.readFileSync(HISTORY_JSON_PATH, 'utf-8'));
    }

    const today = new Date().toISOString().split('T')[0];
    let updated = false;

    // Manejar si playersData es un Array (muy común en Astro) o un Objeto llave-valor
    const isArray = Array.isArray(playersData);
    const keys = isArray ? playersData.map(p => p.id || p.key).filter(Boolean) : Object.keys(WIKIPEDIA_URLS);

    for (const key of Object.keys(WIKIPEDIA_URLS)) {
      console.log(`Buscando goles actuales para: ${key}...`);
      const scrapedGoals = await fetchGoalsFromWikipedia(WIKIPEDIA_URLS[key]);

      // Buscar la referencia del jugador actual en tus datos locales
      let currentGoals = 0;
      let playerRef = null;

      if (isArray) {
        playerRef = playersData.find(p => (p.id && p.id.toLowerCase() === key) || (p.name && p.name.toLowerCase().includes(key)));
        if (playerRef) currentGoals = playerRef.goals || 0;
      } else if (playersData[key]) {
        currentGoals = playersData[key].goals || 0;
      }

      if (scrapedGoals !== null && scrapedGoals >= currentGoals) {
        if (scrapedGoals > currentGoals) {
          if (isArray && playerRef) {
            playerRef.goals = scrapedGoals;
            playerRef.updatedAt = today; // Soportar el formato de tu placeholder
          } else if (!isArray) {
            playersData[key].goals = scrapedGoals;
            playersData[key].last_updated = today;
          }
          updated = true;
          console.log(`¡NUEVO GOL! ${key} ahora tiene ${scrapedGoals} goles.`);
        } else {
          console.log(`${key} se mantiene con ${scrapedGoals} goles.`);
        }
      } else {
        console.log(`No se pudo actualizar o no hay cambios para ${key}.`);
      }
    }

    // 3. Guardar cambios siempre porque siempre cambia la fecha
      fs.writeFileSync(PLAYERS_JSON_PATH, JSON.stringify(playersData, null, 2));

      const snapshot = { date: today, scores: {} };
      if (isArray) {
        playersData.forEach(p => {
          const id = p.id || p.name.toLowerCase().split(' ')[0];
          snapshot.scores[id] = p.goals;
        });
      } else {
        Object.keys(playersData).forEach(key => {
          snapshot.scores[key] = playersData[key].goals;
        });
      }

      historyData = historyData.filter(item => item.date !== today);
      historyData.push(snapshot);
      fs.writeFileSync(HISTORY_JSON_PATH, JSON.stringify(historyData, null, 2));

      console.log('Archivos JSON actualizados con éxito.');
    

  } catch (err) {
    console.error('Error crítico en la ejecución del script:', err);
    process.exit(1);
  }
}

main();