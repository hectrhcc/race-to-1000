# Configuración de GitHub Actions - Race to 1000

## Pasos de Configuración

### 1. Actualizar tu Nombre y Email en el Workflow

Abre [.github/workflows/update.yml](.github/workflows/update.yml) y reemplaza estas líneas:

```yaml
- name: Configure Git user
  run: |
    git config --global user.name "Tu Nombre"
    git config --global user.email "tu_username@users.noreply.github.com"
```

Con tus datos reales:
- **"Tu Nombre"**: Tu nombre completo (ej: "Juan García Pérez")
- **"tu_username"**: Tu usuario de GitHub (ej: "juangarcia")

**Ejemplo completo:**
```yaml
git config --global user.name "Juan García"
git config --global user.email "juangarcia@users.noreply.github.com"
```

### 2. Encontrar tu Email noreply de GitHub

Tu email noreply tiene el formato:
```
{tu_usuario}@users.noreply.github.com
```

Puedes verificarlo en: **GitHub → Settings → Email → Primary email address**

### 3. Instalar Dependencias Necesarias

Ejecuta localmente para instalar `tsx` (necesario para ejecutar TypeScript):

```bash
npm install -D tsx
```

### 4. Probar el Script Localmente

Antes de hacer push, prueba que el script funciona:

```bash
npm exec tsx scripts/updatePlayers.ts
```

Deberías ver un output como:
```
🚀 Iniciando actualización de datos de jugadores...

📊 Datos actuales cargados
   Total de jugadores: 5
   Última sincronización: 2026-07-08T15:30:00.000Z

🔄 Actualizando: Cristiano Ronaldo...
   ✓ Cristiano Ronaldo: Sin cambios (976 goles)

...más jugadores...

✅ Actualización completada:
   • Jugadores actualizados: 0
   • Última sincronización: 2026-07-08T09:00:00.123Z
```

### 5. Verificar la Estructura del archivo players.json

Después de ejecutar el script, tu `src/data/players.json` tendrá esta estructura:

```json
{
  "lastChecked": "2026-07-08T09:00:00.123Z",
  "players": [
    {
      "id": "ronaldo",
      "name": "Cristiano Ronaldo",
      "goals": 976,
      "updatedAt": "2026-07-08",
      ...otros campos...
    },
    ...más jugadores...
  ]
}
```

### 6. Hacer Commit y Push

```bash
git add .
git commit -m "chore: setup github actions for daily sync"
git push origin main
```

### 7. Verificar el Workflow en GitHub

1. Abre tu repositorio en GitHub
2. Ve a **Actions** → **Daily Player Sync**
3. Deberías ver el workflow en la lista

#### Ejecutar Manualmente (para probar):
- Click en **Daily Player Sync**
- Click en el botón **Run workflow**
- Click en **Run workflow** nuevamente

#### Próximas Ejecuciones Automáticas:
- Se ejecutará automáticamente cada día a las **09:00 UTC**
- Los cambios se commitearán y pushearán automáticamente

### 8. Monitorear Ejecuciones

En la sección **Actions** puedes ver:
- **Estado** de cada ejecución (✓ exitoso, ✗ falló)
- **Logs** detallados de cada paso
- **Commits** generados automáticamente

## Estructura de Commits Automáticos

El workflow generará commits con este formato:

```
chore: daily player sync (2026-07-08)
```

La fecha se actualiza automáticamente cada día.

## Solución de Problemas

### El workflow no se ejecuta
- ✓ Verifica que está habilitado en **Settings → Actions → General**
- ✓ Confirma que tienes permisos de escritura (contents: write)

### Error: "Command not found: tsx"
- Ejecuta `npm install -D tsx` localmente
- Haz commit y push de los cambios en package.json

### No ve cambios en players.json
- Verifica que las URLs de Wikipedia en `updatePlayers.ts` son correctas
- Revisa los logs del workflow para errores de scraping

### Git config no funciona
- Asegúrate de que el email tiene el formato correcto: `usuario@users.noreply.github.com`
- Verifica que tu usuario de GitHub es correcto

## Personalización Adicional

### Cambiar la Hora de Ejecución

En [.github/workflows/update.yml](.github/workflows/update.yml), modifica:

```yaml
schedule:
  - cron: '0 9 * * *'  # 09:00 UTC todos los días
```

- **Formato cron**: `minuto hora día mes día_semana`
- `0 9 * * *` = 09:00 UTC cada día
- `0 14 * * 1-5` = 14:00 UTC solo lunes a viernes
- `0 */6 * * *` = Cada 6 horas

### Agregar Más Jugadores

En [scripts/updatePlayers.ts](scripts/updatePlayers.ts), agrega a `WIKIPEDIA_URLS`:

```typescript
const WIKIPEDIA_URLS = {
  ronaldo: 'https://en.wikipedia.org/wiki/Cristiano_Ronaldo',
  messi: 'https://en.wikipedia.org/wiki/Lionel_Messi',
  // Agrega aquí:
  neymar: 'https://en.wikipedia.org/wiki/Neymar',
};
```

### Integrar con Otra API

En lugar de Wikipedia, puedes usar:
- **API-Football** (RapidAPI)
- **SportRadar**
- **Statsapi.com**

Reemplaza la función `fetchGoalsFromWikipedia()` con tu API específica.

## Variables de Entorno (Opcional)

Si necesitas tokens de API, agrégalos como **Secrets** en GitHub:

1. Ve a **Settings → Secrets and variables → Actions**
2. Click en **New repository secret**
3. Nombre: `API_TOKEN`
4. Valor: tu token

En el workflow:
```yaml
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
```

En el script TypeScript:
```typescript
const apiToken = process.env.API_TOKEN;
```

---

**¡Listo!** Tu workflow de GitHub Actions está configurado para sincronizar datos automáticamente cada día. 🎉
