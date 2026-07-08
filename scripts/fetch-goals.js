name: Update Player Goals

on:
  schedule:
    - cron: '0 0,12 * * *'
  workflow_dispatch:

jobs:
  # Cambiamos el ID del job para que coincida perfectamente
  Fetch-and-Update-Player-Goals:
    name: Fetch & Update Player Goals
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    # Corrección de seguridad: Si no encuentra el package-lock.json, usa 'npm install' normal
    - name: Install dependencies
      run: npm install

    - name: Fetch latest goals
      run: node scripts/fetch-goals.js

    - name: Commit and Push changes
      run: |
        git config --global user.name "github-actions[bot]"
        git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"
        
        if [ -n "$(git status --porcelain src/data/)" ]; then
          echo "Nuevos goles detectados. Guardando cambios..."
          git add src/data/players.json src/data/history.json
          git commit -m "🤖 Automatización: Goles actualizados"
          git push origin main
        else
          echo "No hay cambios en los marcadores el día de hoy."
        fi