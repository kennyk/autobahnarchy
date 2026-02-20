# Autobahnarchy

Pixel-art PWA teaching German road rules through study and quiz modes with 1-2 player support.

## Tech Stack

- **Vanilla JavaScript** (ES modules, no framework, no build step)
- **HTML5/CSS3** with "Press Start 2P" Google Font
- **PWA** with manifest.json + service worker (cache-first, offline-capable)
- No package.json, no dependencies, no bundler

## Project Structure

```
index.html              # Single-page app, all 4 screens declared in HTML
css/style.css           # All styles, CSS custom properties for theming
js/
  app.js                # Entry point, game state, screen flow orchestration
  screens.js            # DOM rendering functions (one per screen)
  quiz.js               # Pure quiz logic (question selection, scoring, seeded random)
data/
  rules.json            # German road rules (study content)
  quiz.json             # Quiz questions linked to rules via relatedRuleId
assets/
  signs/                # PNGs for road signs
  ui/                   # PWA icons (192, 512)
scripts/
  generate-placeholders.js  # Node script to regenerate placeholder PNGs
sw.js                   # Service worker (cache version: autobahnarchy-v2)
manifest.json           # PWA manifest
docs/plans/             # Design doc and implementation plan
```

## Architecture

Single-page app with screen-swapping via CSS classes. No routing library.

- **State**: Single `state` object in `app.js` holds all game state (no persistence between sessions)
- **Screens**: 4 screens (`title`, `study`, `quiz`, `results`) toggled by adding/removing `.active` class
- **Data flow**: `app.js` orchestrates state + calls render functions from `screens.js`
- **Quiz logic**: Pure functions in `quiz.js` with seeded random (mulberry32) so both players get identical questions in 2-player mode

## Running Locally

```bash
npx serve .
# Open http://localhost:3000
```

No install step needed. The app is static files served directly.

## Key Patterns

- All JS uses ES module `import`/`export` loaded via `<script type="module">`
- CSS uses custom properties defined in `:root` (--bg-dark, --text-light, --accent, --correct, --incorrect, --border)
- Images gracefully hidden when src is empty (CSS selectors handle missing images)
- Player names are hardcoded: Player 1 = "Masha", Player 2 = "Bobby"
- QUESTIONS_PER_QUIZ = 10 (currently only 5 questions exist in quiz.json)

## Service Worker

When modifying cached assets, increment the cache version in `sw.js`:
```javascript
const CACHE_NAME = 'autobahnarchy-v2';  // bump this
```
Also update the ASSETS array if adding new files.

## Adding Content

To add new rules and questions:
1. Add rule objects to `data/rules.json` (include `id`, `type`, `title`, `explanation`, optional `image`)
2. Add corresponding questions to `data/quiz.json` (link via `relatedRuleId`)
3. If adding sign images, place the PNGs in `assets/signs/`
4. Update `sw.js` ASSETS array if new files are added

## Game Flow

Title Screen (select 1/2 players) -> Study Mode (browse rules) -> Quiz Mode (answer questions) -> Results Screen (scores + play again)
