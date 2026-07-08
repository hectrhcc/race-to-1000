import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Rutas a tus archivos de datos
const PLAYERS_JSON_PATH = path.resolve('src/data/players.json');
const HISTORY_JSON_PATH = path.resolve('src/data/history.json');

// Configuración de URLs de Wikipedia (puedes cambiarlas por ESPN u otras si lo prefieres)
const WIKIPEDIA_URLS = {
  cristiano: 'https://en.wikipedia.org/wiki/Cristiano_Ronaldo',
  messi: 'https://en.wikipedia.org/wiki/Lionel_Messi',
  kane: 'https://en.wikipedia.org/wiki/Harry_Kane',
  mbappe: 'https://en.wikipedia.org/wiki/Kylian_Mbapp%C3%A9',
  haaland: 'https://en.wikipedia.org/wiki/Erling_Haaland'
};

// Función auxiliar para raspar los goles totales desde la "Infobox" lateral de Wikipedia
async function fetchGoalsFromWikipedia(url) {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(data);
    
    let totalGoals = 0;

    // Buscamos en la tabla lateral derecha (infobox) los goles en clubes y selección
    $('.infobox-data-number').each((i, el) => {
      const text = $(el).text().trim();
      // Filtramos números que estén entre paréntesis ej: "(550)" o "(62)" que suelen ser los goles
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
  // 1. Leer los datos actuales para no bajarlos si hay un error
  const playersData = JSON.parse(fs.readFileSync(PLAYERS_JSON_PATH, 'utf-8'));
  let historyData = [];
  if (fs.existsSync(HISTORY_JSON_PATH)) {
    historyData = JSON.parse(fs.readFileSync(HISTORY_JSON_PATH, 'utf-8'));
  }

  const today = new Date().toISOString().split('T')[0];
  let updated = false;

  // 2. Recorrer cada jugador y buscar sus goles
  for (const playerKey of Object.keys(WIKIPEDIA_URLS)) {
    console.log(`Buscando goles actuales para: ${playerKey}...`);
    const scrapedGoals = await fetchGoalsFromWikipedia(WIKIPEDIA_URLS[playerKey]);

    if (scrapedGoals && scrapedGoals >= playersData[playerKey].goals) {
      if (scrapedGoals > playersData[playerKey].goals) {
        playersData[playerKey].goals = scrapedGoals;
        playersData[playerKey].last_updated = today;
        updated = true;
        console.log(`¡NUEVO GOL! ${playerKey} ahora tiene ${scrapedGoals} goles.`);
      } else {
        console.log(`${playerKey} se mantiene con ${scrapedGoals} goles.`);
      }
    } else {
      console.log(`No se pudo actualizar ${playerKey} (evitando bajar el contador actual).`);
    }
  }

  // 3. Guardar cambios si los hubiera
  if (updated) {
    // Guardar en players.json
    fs.writeFileSync(PLAYERS_JSON_PATH, JSON.stringify(playersData, null, 2));

    // Crear un snapshot diario para history.json
    const snapshot = {
      date: today,
      scores: {}
    };
    Object.keys(playersData).forEach(key => {
      snapshot.scores[key] = playersData[key].goals;
    });

    // Evitar duplicar el snapshot del mismo día si corre dos veces
    historyData = historyData.filter(item => item.date !== today);
    historyData.push(snapshot);
    fs.writeFileSync(HISTORY_JSON_PATH, JSON.stringify(historyData, null, 2));

    console.log('Archivos JSON actualizados con éxito.');
  } else {
    console.log('No se detectaron cambios en los marcadores.');
  }
}

main();