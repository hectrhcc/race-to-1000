# Race to 1000 — La carrera por los 1.000 goles

> Sigue a los goleadores más prolíficos del fútbol mundial. La carrera hacia los **1.000 goles oficiales** está en marcha.

![Race to 1000](public/og-image.png)

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

## 📁 Project Structure

```
race-to-1000/
├── .github/workflows/
│   └── update-players.yml    # GitHub Action placeholder (see below)
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── Header.astro        # Hero header with animated goals counter
│   │   ├── Footer.astro        # Footer with last-updated info
│   │   ├── PlayerCard.astro    # Individual player card (photo, stats, progress)
│   │   ├── ProgressBar.astro   # Green progress bar toward 1000 goals
│   │   ├── Ranking.astro       # Full ranking list with medals
│   │   ├── Stats.astro         # Global stats (total goals, averages, milestones)
│   │   └── Timeline.astro      # Historical chart + recent scorers
│   ├── data/
│   │   ├── players.json        # ← UPDATE THIS to refresh goal counts
│   │   └── history.json        # ← APPEND daily snapshots here
│   ├── layouts/
│   │   └── BaseLayout.astro    # HTML base, meta SEO, OG, Twitter Cards
│   ├── pages/
│   │   └── index.astro         # Main page
│   ├── styles/
│   │   └── global.css          # Design tokens, Tailwind v4, animations
│   └── types/
│       └── player.ts           # TypeScript interfaces
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Astro](https://astro.build) | 7.x | Framework (static output) |
| TypeScript | 5.x | Strict type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first styling |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | latest | Auto-generated sitemap |

## 📊 Updating Player Data

### Manual Update

Edit [`src/data/players.json`](src/data/players.json) — every player has:

```json
{
  "id": "ronaldo",
  "name": "Cristiano Ronaldo",
  "country": "Portugal",
  "countryFlag": "🇵🇹",
  "club": "Al Nassr",
  "goals": 961,
  "position": "Delantero",
  "age": 41,
  "image": "https://...",
  "updatedAt": "2026-07-08"
}
```

After updating goals, also append a new entry to [`src/data/history.json`](src/data/history.json):

```json
{
  "date": "2026-07-09",
  "players": {
    "ronaldo": 962,
    "messi": 913
  }
}
```

### Automated Update (GitHub Action)

See [`.github/workflows/update-players.yml`](.github/workflows/update-players.yml) for the template.

To activate automation:
1. Create `scripts/update-players.mjs`
2. Implement the data-fetching logic (see comments in the workflow file)
3. Remove the `if: false` guard from the workflow

## 🏗 Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 📈 Adding to the Timeline

Every time you (or the bot) updates player data, add a new snapshot to `history.json`. The timeline chart auto-builds from this file. The more entries, the richer the visualization.

## 🚀 Deploy

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Netlify
```bash
npm run build
# Deploy ./dist
```

---

> Data accuracy: Goal counts are approximate career totals (club + international). Numbers may vary slightly across sources. Not affiliated with FIFA or any football federation.
