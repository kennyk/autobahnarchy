# Autobahnarchy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a pixel-art PWA teaching German road rules through study and quiz modes with 1-2 player support.

**Architecture:** Single-page vanilla JS application with ES modules. Game state managed in a central object. Screens rendered by swapping visible DOM sections. Service worker caches all assets for offline use.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES modules), PWA (manifest + service worker), "Press Start 2P" Google Font.

---

## Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`
- Create: `manifest.json`
- Create: `sw.js`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p css js data assets/signs assets/ui fonts
```

**Step 2: Create minimal index.html**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#1a1a2e">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>Autobahnarchy</title>
  <link rel="manifest" href="manifest.json">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="game-container">
    <!-- Screens injected here -->
  </div>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

**Step 3: Create minimal CSS**

Create `css/style.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-dark: #1a1a2e;
  --text-light: #e8e8e8;
  --accent: #f0c000;
  --correct: #38b764;
  --incorrect: #b13e53;
  --border: #4a4a6a;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: 'Press Start 2P', cursive;
  background-color: var(--bg-dark);
  color: var(--text-light);
  image-rendering: pixelated;
  -webkit-font-smoothing: none;
}

#game-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
```

**Step 4: Create minimal app.js**

Create `js/app.js`:
```javascript
// Game state
const state = {
  currentScreen: 'title',
  playerCount: 1,
  currentRuleIndex: 0,
  rules: [],
  quizQuestions: [],
  currentQuestionIndex: 0,
  currentPlayer: 1,
  player1Answers: [],
  player2Answers: [],
  selectedQuizQuestions: []
};

// Initialize app
async function init() {
  console.log('Autobahnarchy initializing...');
  registerServiceWorker();
}

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');
    } catch (error) {
      console.log('Service worker registration failed:', error);
    }
  }
}

// Start the app
init();
```

**Step 5: Create PWA manifest**

Create `manifest.json`:
```json
{
  "name": "Autobahnarchy",
  "short_name": "Autobahnarchy",
  "description": "Learn German road rules through pixel-art gaming",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#1a1a2e",
  "orientation": "portrait",
  "icons": [
    {
      "src": "assets/ui/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/ui/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Step 6: Create service worker**

Create `sw.js`:
```javascript
const CACHE_NAME = 'autobahnarchy-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/screens.js',
  '/js/quiz.js',
  '/data/rules.json',
  '/data/quiz.json',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Step 7: Verify setup in browser**

Run:
```bash
npx serve .
```

Open `http://localhost:3000` in browser.
Expected: Dark blue page, console shows "Autobahnarchy initializing..." and "Service worker registered".

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: initial project scaffolding with PWA setup"
```

---

## Task 2: Title Screen

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Create: `js/screens.js`
- Modify: `js/app.js`

**Step 1: Add screen containers to HTML**

Modify `index.html`, replace the `#game-container` div:
```html
  <div id="game-container">
    <!-- Title Screen -->
    <div id="screen-title" class="screen active">
      <h1 class="title">AUTOBAHNARCHY</h1>
      <div class="menu">
        <button class="btn" data-players="1">1 PLAYER</button>
        <button class="btn" data-players="2">2 PLAYERS</button>
      </div>
    </div>

    <!-- Study Screen -->
    <div id="screen-study" class="screen"></div>

    <!-- Quiz Screen -->
    <div id="screen-quiz" class="screen"></div>

    <!-- Results Screen -->
    <div id="screen-results" class="screen"></div>
  </div>
```

**Step 2: Add screen and button styles**

Add to `css/style.css`:
```css
/* Screens */
.screen {
  display: none;
  width: 100%;
  max-width: 400px;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.screen.active {
  display: flex;
}

/* Title Screen */
.title {
  font-size: 1.5rem;
  color: var(--accent);
  margin-bottom: 60px;
  text-shadow: 4px 4px 0 #000;
  line-height: 1.4;
}

/* Buttons */
.btn {
  font-family: 'Press Start 2P', cursive;
  font-size: 0.75rem;
  background-color: var(--bg-dark);
  color: var(--text-light);
  border: 4px solid var(--border);
  padding: 16px 32px;
  margin: 10px;
  cursor: pointer;
  image-rendering: pixelated;
  transition: none;
}

.btn:hover,
.btn:focus {
  background-color: var(--accent);
  color: var(--bg-dark);
  border-color: var(--accent);
  outline: none;
}

.btn:active {
  transform: translate(2px, 2px);
}

.menu {
  display: flex;
  flex-direction: column;
}
```

**Step 3: Create screens.js module**

Create `js/screens.js`:
```javascript
// Show a specific screen, hide others
export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add('active');
  }
}

// Render title screen (already in HTML, just wire up events)
export function initTitleScreen(onPlayerSelect) {
  const buttons = document.querySelectorAll('#screen-title .btn[data-players]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const playerCount = parseInt(btn.dataset.players, 10);
      onPlayerSelect(playerCount);
    });
  });
}
```

**Step 4: Wire up title screen in app.js**

Replace `js/app.js`:
```javascript
import { showScreen, initTitleScreen } from './screens.js';

// Game state
const state = {
  currentScreen: 'title',
  playerCount: 1,
  currentRuleIndex: 0,
  rules: [],
  quizQuestions: [],
  currentQuestionIndex: 0,
  currentPlayer: 1,
  player1Answers: [],
  player2Answers: [],
  selectedQuizQuestions: []
};

// Handle player count selection
function handlePlayerSelect(count) {
  state.playerCount = count;
  console.log(`Selected ${count} player(s)`);
  // TODO: transition to study screen
  showScreen('study');
}

// Initialize app
async function init() {
  console.log('Autobahnarchy initializing...');
  registerServiceWorker();
  initTitleScreen(handlePlayerSelect);
  showScreen('title');
}

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');
    } catch (error) {
      console.log('Service worker registration failed:', error);
    }
  }
}

// Start the app
init();
```

**Step 5: Test in browser**

Run: `npx serve .`
Expected: Title screen shows "AUTOBAHNARCHY" with two buttons. Clicking either logs player count and shows empty study screen.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add title screen with player selection"
```

---

## Task 3: Sample Data Files

**Files:**
- Create: `data/rules.json`
- Create: `data/quiz.json`

**Step 1: Create rules.json with 5 sample rules**

Create `data/rules.json`:
```json
[
  {
    "id": "sign-001",
    "type": "sign",
    "image": "assets/signs/priority-road.png",
    "title": "Priority Road",
    "explanation": "This yellow diamond means you have right-of-way at all intersections ahead until cancelled by another sign."
  },
  {
    "id": "sign-002",
    "type": "sign",
    "image": "assets/signs/end-priority.png",
    "title": "End of Priority Road",
    "explanation": "The crossed-out yellow diamond means you no longer have automatic priority. You must now follow normal right-of-way rules."
  },
  {
    "id": "verbal-001",
    "type": "verbal",
    "title": "Right Before Left (Rechts vor Links)",
    "explanation": "At intersections without signs or signals, you must yield to vehicles approaching from your RIGHT. This is the opposite of some US practices.",
    "image": null
  },
  {
    "id": "sign-003",
    "type": "sign",
    "image": "assets/signs/town-entry.png",
    "title": "Town Entry Sign",
    "explanation": "Yellow sign with town name means you're entering a built-up area. Speed limit drops to 50 km/h (31 mph) unless otherwise posted."
  },
  {
    "id": "sign-004",
    "type": "sign",
    "image": "assets/signs/autobahn.png",
    "title": "Autobahn",
    "explanation": "Blue sign with white highway symbol indicates Autobahn entry. No mandatory speed limit exists, but 130 km/h (80 mph) is recommended."
  }
]
```

**Step 2: Create quiz.json with matching questions**

Create `data/quiz.json`:
```json
[
  {
    "id": "q-001",
    "relatedRuleId": "sign-001",
    "questionType": "sign",
    "image": "assets/signs/priority-road.png",
    "questionText": "What does this yellow diamond sign mean?",
    "answers": [
      { "text": "You have priority at upcoming intersections", "correct": true },
      { "text": "Caution: construction zone ahead", "correct": false },
      { "text": "Yield to all traffic", "correct": false },
      { "text": "None of the above", "correct": false }
    ],
    "multiSelect": false
  },
  {
    "id": "q-002",
    "relatedRuleId": "sign-002",
    "questionType": "sign",
    "image": "assets/signs/end-priority.png",
    "questionText": "What does the crossed-out yellow diamond mean?",
    "answers": [
      { "text": "End of priority road - follow normal rules", "correct": true },
      { "text": "No parking zone begins", "correct": false },
      { "text": "End of speed limit", "correct": false },
      { "text": "None of the above", "correct": false }
    ],
    "multiSelect": false
  },
  {
    "id": "q-003",
    "relatedRuleId": "verbal-001",
    "questionType": "verbal",
    "image": null,
    "questionText": "At an unmarked intersection in Germany, who has right-of-way?",
    "answers": [
      { "text": "Vehicle approaching from the RIGHT", "correct": true },
      { "text": "Vehicle approaching from the LEFT", "correct": false },
      { "text": "Whoever arrives first", "correct": false },
      { "text": "None of the above", "correct": false }
    ],
    "multiSelect": false
  },
  {
    "id": "q-004",
    "relatedRuleId": "sign-003",
    "questionType": "sign",
    "image": "assets/signs/town-entry.png",
    "questionText": "What happens when you see a yellow town name sign?",
    "answers": [
      { "text": "Speed limit becomes 50 km/h unless posted otherwise", "correct": true },
      { "text": "Speed limit becomes 30 km/h", "correct": false },
      { "text": "No change to speed limit", "correct": false },
      { "text": "None of the above", "correct": false }
    ],
    "multiSelect": false
  },
  {
    "id": "q-005",
    "relatedRuleId": "sign-004",
    "questionType": "verbal",
    "image": null,
    "questionText": "What is the mandatory speed limit on the German Autobahn?",
    "answers": [
      { "text": "There is no mandatory limit, but 130 km/h is recommended", "correct": true },
      { "text": "120 km/h at all times", "correct": false },
      { "text": "No limit whatsoever, no recommendations", "correct": false },
      { "text": "None of the above", "correct": false }
    ],
    "multiSelect": false
  }
]
```

**Step 3: Commit**

```bash
git add data/
git commit -m "feat: add sample rules and quiz data"
```

---

## Task 4: Placeholder Sign Assets

**Files:**
- Create: `assets/signs/priority-road.png`
- Create: `assets/signs/end-priority.png`
- Create: `assets/signs/town-entry.png`
- Create: `assets/signs/autobahn.png`
- Create: `assets/ui/icon-192.png`
- Create: `assets/ui/icon-512.png`

**Step 1: Create placeholder SVG signs and convert to PNG**

For now, create simple colored placeholder PNGs. These are 64x64 pixel placeholders.

Create a simple generation script or use any image editor to create:
- `priority-road.png`: Yellow diamond on transparent background
- `end-priority.png`: Yellow diamond with black X through it
- `town-entry.png`: Yellow rectangle with "ORT" text
- `autobahn.png`: Blue rectangle with white lines

**Alternative: Use base64 inline images temporarily**

For rapid development, we can embed placeholder colors directly. Skip this task and modify the rendering to show colored divs as placeholders, then revisit with real assets later.

**Step 2: Create app icons**

Create simple 192x192 and 512x512 PNG icons with "A" in pixel style on dark blue background.

**Step 3: Commit**

```bash
git add assets/
git commit -m "feat: add placeholder sign and icon assets"
```

**Note:** This task can be simplified by using CSS-based placeholders initially. The implementation should gracefully handle missing images.

---

## Task 5: Study Screen

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/screens.js`
- Modify: `js/app.js`

**Step 1: Add study screen HTML structure**

In `index.html`, replace the empty `#screen-study` div:
```html
    <!-- Study Screen -->
    <div id="screen-study" class="screen">
      <div class="rule-counter">Rule <span id="rule-current">1</span> of <span id="rule-total">5</span></div>
      <div class="rule-card">
        <img id="rule-image" class="rule-image" src="" alt="">
        <h2 id="rule-title" class="rule-title"></h2>
        <p id="rule-explanation" class="rule-explanation"></p>
      </div>
      <div class="study-buttons">
        <button id="btn-next-rule" class="btn">NEXT RULE</button>
        <button id="btn-start-quiz" class="btn btn-accent">START QUIZ</button>
      </div>
    </div>
```

**Step 2: Add study screen styles**

Add to `css/style.css`:
```css
/* Study Screen */
.rule-counter {
  font-size: 0.6rem;
  color: var(--border);
  margin-bottom: 20px;
}

.rule-card {
  background-color: rgba(255, 255, 255, 0.05);
  border: 4px solid var(--border);
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 350px;
}

.rule-image {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: block;
  image-rendering: pixelated;
  background-color: var(--border);
}

.rule-image[src=""],
.rule-image:not([src]),
.rule-image.hidden {
  display: none;
}

.rule-title {
  font-size: 0.8rem;
  color: var(--accent);
  margin-bottom: 15px;
  line-height: 1.4;
}

.rule-explanation {
  font-size: 0.55rem;
  line-height: 1.8;
  text-align: left;
}

.study-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-accent {
  background-color: var(--accent);
  color: var(--bg-dark);
  border-color: var(--accent);
}

.btn-accent:hover {
  background-color: var(--text-light);
  border-color: var(--text-light);
}
```

**Step 3: Add study screen functions to screens.js**

Add to `js/screens.js`:
```javascript
// Render a rule on the study screen
export function renderRule(rule, currentIndex, totalRules) {
  document.getElementById('rule-current').textContent = currentIndex + 1;
  document.getElementById('rule-total').textContent = totalRules;
  document.getElementById('rule-title').textContent = rule.title;
  document.getElementById('rule-explanation').textContent = rule.explanation;

  const img = document.getElementById('rule-image');
  if (rule.image) {
    img.src = rule.image;
    img.classList.remove('hidden');
  } else {
    img.src = '';
    img.classList.add('hidden');
  }
}

// Initialize study screen event handlers
export function initStudyScreen(onNextRule, onStartQuiz) {
  document.getElementById('btn-next-rule').addEventListener('click', onNextRule);
  document.getElementById('btn-start-quiz').addEventListener('click', onStartQuiz);
}
```

**Step 4: Load data and wire up study screen in app.js**

Update `js/app.js`:
```javascript
import { showScreen, initTitleScreen, initStudyScreen, renderRule } from './screens.js';

// Game state
const state = {
  currentScreen: 'title',
  playerCount: 1,
  currentRuleIndex: 0,
  rules: [],
  quizQuestions: [],
  currentQuestionIndex: 0,
  currentPlayer: 1,
  player1Answers: [],
  player2Answers: [],
  selectedQuizQuestions: []
};

// Load JSON data
async function loadData() {
  try {
    const [rulesRes, quizRes] = await Promise.all([
      fetch('/data/rules.json'),
      fetch('/data/quiz.json')
    ]);
    state.rules = await rulesRes.json();
    state.quizQuestions = await quizRes.json();
    console.log(`Loaded ${state.rules.length} rules and ${state.quizQuestions.length} questions`);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

// Handle player count selection
function handlePlayerSelect(count) {
  state.playerCount = count;
  state.currentRuleIndex = 0;
  console.log(`Selected ${count} player(s)`);
  renderRule(state.rules[0], 0, state.rules.length);
  showScreen('study');
}

// Handle next rule button
function handleNextRule() {
  state.currentRuleIndex = (state.currentRuleIndex + 1) % state.rules.length;
  renderRule(state.rules[state.currentRuleIndex], state.currentRuleIndex, state.rules.length);
}

// Handle start quiz button
function handleStartQuiz() {
  console.log('Starting quiz...');
  // TODO: implement quiz
  showScreen('quiz');
}

// Initialize app
async function init() {
  console.log('Autobahnarchy initializing...');
  registerServiceWorker();
  await loadData();
  initTitleScreen(handlePlayerSelect);
  initStudyScreen(handleNextRule, handleStartQuiz);
  showScreen('title');
}

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');
    } catch (error) {
      console.log('Service worker registration failed:', error);
    }
  }
}

// Start the app
init();
```

**Step 5: Test in browser**

Run: `npx serve .`
Expected:
- Title screen works
- Clicking player button goes to study screen
- Study screen shows first rule with title, explanation, counter
- "NEXT RULE" cycles through rules
- "START QUIZ" goes to empty quiz screen

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add study screen with rule navigation"
```

---

## Task 6: Quiz Logic Module

**Files:**
- Create: `js/quiz.js`

**Step 1: Create quiz.js with pure functions**

Create `js/quiz.js`:
```javascript
// Select N random questions from the pool
// Uses seeded random for reproducibility in 2-player mode
export function selectQuestions(allQuestions, count, seed) {
  const shuffled = [...allQuestions];
  let currentSeed = seed;

  // Simple seeded random (mulberry32)
  const seededRandom = () => {
    currentSeed |= 0;
    currentSeed = currentSeed + 0x6D2B79F5 | 0;
    let t = Math.imul(currentSeed ^ currentSeed >>> 15, 1 | currentSeed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Check if answer is correct
// For multiSelect: all correct answers must be selected, no incorrect ones
// For single select: the selected answer must be correct
export function checkAnswer(question, selectedIndices) {
  const correctIndices = question.answers
    .map((ans, idx) => ans.correct ? idx : -1)
    .filter(idx => idx !== -1);

  if (question.multiSelect) {
    // Must match exactly
    if (selectedIndices.length !== correctIndices.length) return false;
    return selectedIndices.every(idx => correctIndices.includes(idx));
  } else {
    // Single select: exactly one answer, must be correct
    return selectedIndices.length === 1 && correctIndices.includes(selectedIndices[0]);
  }
}

// Calculate score from answers array
// answers is array of { questionId, selectedIndices, correct }
export function calculateScore(answers) {
  const correct = answers.filter(a => a.correct).length;
  return {
    correct,
    total: answers.length,
    percentage: Math.round((correct / answers.length) * 100)
  };
}

// Determine winner in 2-player mode
export function determineWinner(player1Score, player2Score) {
  if (player1Score.correct > player2Score.correct) {
    return { winner: 'Masha', player1Score, player2Score };
  } else if (player2Score.correct > player1Score.correct) {
    return { winner: 'Bobby', player1Score, player2Score };
  } else {
    return { winner: 'tie', player1Score, player2Score };
  }
}

// Generate a seed from current timestamp
export function generateSeed() {
  return Date.now();
}
```

**Step 2: Test quiz logic manually in console**

After starting the server, open browser console and test:
```javascript
import('/js/quiz.js').then(quiz => {
  const questions = [{answers: [{correct: true}, {correct: false}], multiSelect: false}];
  console.log('Select 1:', quiz.selectQuestions(questions, 1, 12345));
  console.log('Check correct:', quiz.checkAnswer(questions[0], [0])); // true
  console.log('Check incorrect:', quiz.checkAnswer(questions[0], [1])); // false
});
```

**Step 3: Commit**

```bash
git add js/quiz.js
git commit -m "feat: add quiz logic module with scoring functions"
```

---

## Task 7: Quiz Screen

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/screens.js`
- Modify: `js/app.js`

**Step 1: Add quiz screen HTML structure**

In `index.html`, replace the empty `#screen-quiz` div:
```html
    <!-- Quiz Screen -->
    <div id="screen-quiz" class="screen">
      <div class="quiz-header">
        <span id="quiz-player" class="quiz-player">MASHA</span>
        <span id="quiz-progress">Q1/10</span>
      </div>
      <div class="quiz-card">
        <img id="quiz-image" class="quiz-image" src="" alt="">
        <p id="quiz-question" class="quiz-question"></p>
        <div id="quiz-answers" class="quiz-answers"></div>
      </div>
      <button id="btn-submit-answer" class="btn btn-accent" disabled>SUBMIT</button>
      <div id="quiz-feedback" class="quiz-feedback hidden"></div>
    </div>
```

**Step 2: Add quiz screen styles**

Add to `css/style.css`:
```css
/* Quiz Screen */
.quiz-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 350px;
  margin-bottom: 20px;
  font-size: 0.6rem;
}

.quiz-player {
  color: var(--accent);
}

.quiz-card {
  background-color: rgba(255, 255, 255, 0.05);
  border: 4px solid var(--border);
  padding: 20px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 350px;
}

.quiz-image {
  width: 64px;
  height: 64px;
  margin: 0 auto 15px;
  display: block;
  image-rendering: pixelated;
  background-color: var(--border);
}

.quiz-image[src=""],
.quiz-image:not([src]),
.quiz-image.hidden {
  display: none;
}

.quiz-question {
  font-size: 0.6rem;
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: left;
}

.quiz-answers {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-btn {
  font-family: 'Press Start 2P', cursive;
  font-size: 0.5rem;
  background-color: transparent;
  color: var(--text-light);
  border: 2px solid var(--border);
  padding: 12px;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: none;
}

.answer-btn:hover {
  border-color: var(--text-light);
}

.answer-btn.selected {
  background-color: var(--accent);
  color: var(--bg-dark);
  border-color: var(--accent);
}

.answer-btn.correct {
  background-color: var(--correct);
  border-color: var(--correct);
  color: var(--bg-dark);
}

.answer-btn.incorrect {
  background-color: var(--incorrect);
  border-color: var(--incorrect);
  color: var(--text-light);
}

.quiz-feedback {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 100;
  pointer-events: none;
}

.quiz-feedback.hidden {
  display: none;
}

.quiz-feedback.correct {
  background-color: rgba(56, 183, 100, 0.3);
  color: var(--correct);
}

.quiz-feedback.incorrect {
  background-color: rgba(177, 62, 83, 0.3);
  color: var(--incorrect);
}

#btn-submit-answer:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Step 3: Add quiz screen functions to screens.js**

Add to `js/screens.js`:
```javascript
// Render a quiz question
export function renderQuestion(question, questionIndex, totalQuestions, playerName, onAnswerSelect) {
  document.getElementById('quiz-player').textContent = playerName.toUpperCase();
  document.getElementById('quiz-progress').textContent = `Q${questionIndex + 1}/${totalQuestions}`;
  document.getElementById('quiz-question').textContent = question.questionText;

  const img = document.getElementById('quiz-image');
  if (question.image) {
    img.src = question.image;
    img.classList.remove('hidden');
  } else {
    img.src = '';
    img.classList.add('hidden');
  }

  const answersContainer = document.getElementById('quiz-answers');
  answersContainer.innerHTML = '';

  question.answers.forEach((answer, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer.text;
    btn.dataset.index = idx;
    btn.addEventListener('click', () => onAnswerSelect(idx, question.multiSelect));
    answersContainer.appendChild(btn);
  });

  // Reset submit button
  document.getElementById('btn-submit-answer').disabled = true;
}

// Update answer selection UI
export function updateAnswerSelection(selectedIndices, multiSelect) {
  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('selected', selectedIndices.includes(idx));
  });
  document.getElementById('btn-submit-answer').disabled = selectedIndices.length === 0;
}

// Show correct/incorrect feedback on answers
export function showAnswerFeedback(question, selectedIndices, isCorrect) {
  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach((btn, idx) => {
    const answer = question.answers[idx];
    if (answer.correct) {
      btn.classList.add('correct');
    } else if (selectedIndices.includes(idx)) {
      btn.classList.add('incorrect');
    }
    btn.disabled = true;
  });

  // Show overlay feedback
  const feedback = document.getElementById('quiz-feedback');
  feedback.textContent = isCorrect ? 'CORRECT!' : 'WRONG!';
  feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
}

// Hide feedback overlay
export function hideFeedback() {
  document.getElementById('quiz-feedback').className = 'quiz-feedback hidden';
}

// Initialize quiz screen event handlers
export function initQuizScreen(onSubmit) {
  document.getElementById('btn-submit-answer').addEventListener('click', onSubmit);
}
```

**Step 4: Wire up quiz logic in app.js**

Update `js/app.js` (full replacement):
```javascript
import { showScreen, initTitleScreen, initStudyScreen, initQuizScreen, renderRule, renderQuestion, updateAnswerSelection, showAnswerFeedback, hideFeedback } from './screens.js';
import { selectQuestions, checkAnswer, calculateScore, determineWinner, generateSeed } from './quiz.js';

// Game state
const state = {
  currentScreen: 'title',
  playerCount: 1,
  currentRuleIndex: 0,
  rules: [],
  quizQuestions: [],
  currentQuestionIndex: 0,
  currentPlayer: 1,
  player1Answers: [],
  player2Answers: [],
  selectedQuizQuestions: [],
  selectedAnswerIndices: [],
  quizSeed: 0
};

const QUESTIONS_PER_QUIZ = 10;

// Load JSON data
async function loadData() {
  try {
    const [rulesRes, quizRes] = await Promise.all([
      fetch('/data/rules.json'),
      fetch('/data/quiz.json')
    ]);
    state.rules = await rulesRes.json();
    state.quizQuestions = await quizRes.json();
    console.log(`Loaded ${state.rules.length} rules and ${state.quizQuestions.length} questions`);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

// Handle player count selection
function handlePlayerSelect(count) {
  state.playerCount = count;
  state.currentRuleIndex = 0;
  console.log(`Selected ${count} player(s)`);
  renderRule(state.rules[0], 0, state.rules.length);
  showScreen('study');
}

// Handle next rule button
function handleNextRule() {
  state.currentRuleIndex = (state.currentRuleIndex + 1) % state.rules.length;
  renderRule(state.rules[state.currentRuleIndex], state.currentRuleIndex, state.rules.length);
}

// Handle start quiz button
function handleStartQuiz() {
  // Reset quiz state
  state.currentPlayer = 1;
  state.player1Answers = [];
  state.player2Answers = [];
  state.currentQuestionIndex = 0;
  state.selectedAnswerIndices = [];
  state.quizSeed = generateSeed();

  // Select questions (same for both players via seed)
  state.selectedQuizQuestions = selectQuestions(
    state.quizQuestions,
    Math.min(QUESTIONS_PER_QUIZ, state.quizQuestions.length),
    state.quizSeed
  );

  console.log(`Starting quiz with ${state.selectedQuizQuestions.length} questions`);

  // Show first question
  const playerName = state.currentPlayer === 1 ? 'Masha' : 'Bobby';
  renderQuestion(
    state.selectedQuizQuestions[0],
    0,
    state.selectedQuizQuestions.length,
    playerName,
    handleAnswerSelect
  );
  showScreen('quiz');
}

// Handle answer selection
function handleAnswerSelect(index, multiSelect) {
  if (multiSelect) {
    // Toggle selection
    const idx = state.selectedAnswerIndices.indexOf(index);
    if (idx === -1) {
      state.selectedAnswerIndices.push(index);
    } else {
      state.selectedAnswerIndices.splice(idx, 1);
    }
  } else {
    // Single select
    state.selectedAnswerIndices = [index];
  }
  updateAnswerSelection(state.selectedAnswerIndices, multiSelect);
}

// Handle submit answer
function handleSubmitAnswer() {
  const question = state.selectedQuizQuestions[state.currentQuestionIndex];
  const isCorrect = checkAnswer(question, state.selectedAnswerIndices);

  // Record answer
  const answer = {
    questionId: question.id,
    selectedIndices: [...state.selectedAnswerIndices],
    correct: isCorrect
  };

  if (state.currentPlayer === 1) {
    state.player1Answers.push(answer);
  } else {
    state.player2Answers.push(answer);
  }

  // Show feedback
  showAnswerFeedback(question, state.selectedAnswerIndices, isCorrect);

  // After delay, move to next question or end quiz
  setTimeout(() => {
    hideFeedback();
    state.selectedAnswerIndices = [];
    state.currentQuestionIndex++;

    if (state.currentQuestionIndex >= state.selectedQuizQuestions.length) {
      // End of quiz for current player
      if (state.playerCount === 2 && state.currentPlayer === 1) {
        // Switch to player 2
        state.currentPlayer = 2;
        state.currentQuestionIndex = 0;
        alert("MASHA'S TURN COMPLETE!\n\nPass the device to BOBBY.");
        const playerName = 'Bobby';
        renderQuestion(
          state.selectedQuizQuestions[0],
          0,
          state.selectedQuizQuestions.length,
          playerName,
          handleAnswerSelect
        );
      } else {
        // Show results
        showResults();
      }
    } else {
      // Next question
      const playerName = state.currentPlayer === 1 ? 'Masha' : 'Bobby';
      renderQuestion(
        state.selectedQuizQuestions[state.currentQuestionIndex],
        state.currentQuestionIndex,
        state.selectedQuizQuestions.length,
        playerName,
        handleAnswerSelect
      );
    }
  }, 1500);
}

// Show results screen
function showResults() {
  console.log('Quiz complete, showing results');
  // TODO: implement results screen
  showScreen('results');
}

// Initialize app
async function init() {
  console.log('Autobahnarchy initializing...');
  registerServiceWorker();
  await loadData();
  initTitleScreen(handlePlayerSelect);
  initStudyScreen(handleNextRule, handleStartQuiz);
  initQuizScreen(handleSubmitAnswer);
  showScreen('title');
}

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');
    } catch (error) {
      console.log('Service worker registration failed:', error);
    }
  }
}

// Start the app
init();
```

**Step 5: Test quiz flow in browser**

Run: `npx serve .`
Test:
- Start 1-player game, study, click START QUIZ
- Answer questions, verify feedback shows correct/incorrect
- Complete all questions, verify it goes to results screen
- Start 2-player game, complete Masha's questions
- Verify alert appears, then Bobby's questions begin

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add quiz screen with question flow and scoring"
```

---

## Task 8: Results Screen

**Files:**
- Modify: `index.html`
- Modify: `css/style.css`
- Modify: `js/screens.js`
- Modify: `js/app.js`

**Step 1: Add results screen HTML structure**

In `index.html`, replace the empty `#screen-results` div:
```html
    <!-- Results Screen -->
    <div id="screen-results" class="screen">
      <h2 class="results-title">RESULTS</h2>
      <div id="results-content" class="results-content"></div>
      <button id="btn-play-again" class="btn btn-accent">PLAY AGAIN</button>
    </div>
```

**Step 2: Add results screen styles**

Add to `css/style.css`:
```css
/* Results Screen */
.results-title {
  font-size: 1.2rem;
  color: var(--accent);
  margin-bottom: 30px;
}

.results-content {
  width: 100%;
  max-width: 350px;
  margin-bottom: 30px;
}

.result-card {
  background-color: rgba(255, 255, 255, 0.05);
  border: 4px solid var(--border);
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.result-player {
  font-size: 0.8rem;
  color: var(--accent);
  margin-bottom: 10px;
}

.result-score {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.result-percentage {
  font-size: 0.6rem;
  color: var(--border);
}

.winner-announcement {
  font-size: 1rem;
  color: var(--accent);
  margin-bottom: 20px;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

.tie-announcement {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-bottom: 20px;
}

.missed-questions {
  text-align: left;
  font-size: 0.5rem;
  line-height: 1.6;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid var(--border);
}

.missed-questions h4 {
  color: var(--incorrect);
  margin-bottom: 10px;
}

.missed-item {
  margin-bottom: 8px;
  color: var(--border);
}
```

**Step 3: Add results screen functions to screens.js**

Add to `js/screens.js`:
```javascript
// Render results screen for 1 player
export function renderSinglePlayerResults(score, missedQuestions) {
  const content = document.getElementById('results-content');

  let html = `
    <div class="result-card">
      <div class="result-player">MASHA</div>
      <div class="result-score">${score.correct}/${score.total}</div>
      <div class="result-percentage">${score.percentage}%</div>
  `;

  if (missedQuestions.length > 0) {
    html += `
      <div class="missed-questions">
        <h4>REVIEW THESE:</h4>
        ${missedQuestions.map(q => `<div class="missed-item">• ${q}</div>`).join('')}
      </div>
    `;
  }

  html += '</div>';
  content.innerHTML = html;
}

// Render results screen for 2 players
export function renderTwoPlayerResults(result) {
  const content = document.getElementById('results-content');

  let winnerHtml = '';
  if (result.winner === 'tie') {
    winnerHtml = `<div class="tie-announcement">IT'S A TIE!</div>`;
  } else {
    winnerHtml = `<div class="winner-announcement">${result.winner.toUpperCase()} WINS!</div>`;
  }

  const html = `
    ${winnerHtml}
    <div class="result-card">
      <div class="result-player">MASHA</div>
      <div class="result-score">${result.player1Score.correct}/${result.player1Score.total}</div>
      <div class="result-percentage">${result.player1Score.percentage}%</div>
    </div>
    <div class="result-card">
      <div class="result-player">BOBBY</div>
      <div class="result-score">${result.player2Score.correct}/${result.player2Score.total}</div>
      <div class="result-percentage">${result.player2Score.percentage}%</div>
    </div>
  `;

  content.innerHTML = html;
}

// Initialize results screen event handlers
export function initResultsScreen(onPlayAgain) {
  document.getElementById('btn-play-again').addEventListener('click', onPlayAgain);
}
```

**Step 4: Wire up results screen in app.js**

Add imports at top of `js/app.js`:
```javascript
import { showScreen, initTitleScreen, initStudyScreen, initQuizScreen, initResultsScreen, renderRule, renderQuestion, updateAnswerSelection, showAnswerFeedback, hideFeedback, renderSinglePlayerResults, renderTwoPlayerResults } from './screens.js';
```

Replace the `showResults` function:
```javascript
// Show results screen
function showResults() {
  const player1Score = calculateScore(state.player1Answers);

  if (state.playerCount === 1) {
    // Get missed question texts
    const missedQuestions = state.player1Answers
      .filter(a => !a.correct)
      .map(a => {
        const q = state.selectedQuizQuestions.find(q => q.id === a.questionId);
        return q ? q.questionText : '';
      })
      .filter(t => t);

    renderSinglePlayerResults(player1Score, missedQuestions);
  } else {
    const player2Score = calculateScore(state.player2Answers);
    const result = determineWinner(player1Score, player2Score);
    renderTwoPlayerResults(result);
  }

  showScreen('results');
}
```

Add `handlePlayAgain` function:
```javascript
// Handle play again button
function handlePlayAgain() {
  showScreen('title');
}
```

Update `init` function to include results screen initialization:
```javascript
// Initialize app
async function init() {
  console.log('Autobahnarchy initializing...');
  registerServiceWorker();
  await loadData();
  initTitleScreen(handlePlayerSelect);
  initStudyScreen(handleNextRule, handleStartQuiz);
  initQuizScreen(handleSubmitAnswer);
  initResultsScreen(handlePlayAgain);
  showScreen('title');
}
```

**Step 5: Test complete game flow**

Run: `npx serve .`
Test full flows:
- 1-player: title → study → quiz → results with score and missed questions → play again
- 2-player: title → study → quiz (Masha) → quiz (Bobby) → results with winner → play again

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add results screen with scores and winner display"
```

---

## Task 9: Polish and PWA Finalization

**Files:**
- Modify: `sw.js` (update asset list)
- Modify: `css/style.css` (responsive tweaks)
- Create: `assets/ui/icon-192.png`
- Create: `assets/ui/icon-512.png`

**Step 1: Create simple app icons**

Create minimal pixel-art "A" icons (or use a placeholder). These can be simple colored squares with a letter for now.

**Step 2: Update service worker asset list**

Update `sw.js` ASSETS array to include all files:
```javascript
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/screens.js',
  '/js/quiz.js',
  '/data/rules.json',
  '/data/quiz.json',
  '/manifest.json',
  '/assets/ui/icon-192.png',
  '/assets/ui/icon-512.png'
];
```

Increment cache version:
```javascript
const CACHE_NAME = 'autobahnarchy-v2';
```

**Step 3: Add responsive CSS tweaks**

Add to `css/style.css`:
```css
/* Responsive adjustments */
@media (max-width: 360px) {
  .title {
    font-size: 1.2rem;
  }

  .btn {
    font-size: 0.6rem;
    padding: 12px 20px;
  }

  .rule-explanation,
  .quiz-question {
    font-size: 0.5rem;
  }
}

/* Prevent text selection and callouts on mobile */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Safe area padding for notched phones */
#game-container {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

**Step 4: Test PWA installation**

1. Serve with HTTPS (required for service workers in production)
2. Open in Chrome/Safari on mobile
3. Verify "Add to Home Screen" option appears
4. Install and test offline functionality

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: finalize PWA with icons and responsive styles"
```

---

## Task 10: Add More Content (Optional)

**Files:**
- Modify: `data/rules.json`
- Modify: `data/quiz.json`
- Create: Additional sign assets in `assets/signs/`

**Step 1: Research and add more German road rules**

Expand rules.json to 15-20 rules covering:
- Speed limits (urban, rural, Autobahn)
- Parking signs
- Environmental zones (Umweltzone)
- Pedestrian zones
- One-way streets
- No passing zones
- Right-of-way signs

**Step 2: Create corresponding quiz questions**

For each new rule, add 1-2 quiz questions to quiz.json.

**Step 3: Create placeholder sign images**

Add simple pixel art representations for each new sign.

**Step 4: Test with expanded content**

Verify study mode cycles through all rules and quiz randomly selects from the pool.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: expand content with additional German road rules"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Project scaffolding | index.html, sw.js, manifest.json |
| 2 | Title screen | screens.js, style.css |
| 3 | Sample data files | rules.json, quiz.json |
| 4 | Placeholder assets | assets/signs/*, assets/ui/* |
| 5 | Study screen | screens.js, app.js |
| 6 | Quiz logic module | quiz.js |
| 7 | Quiz screen | screens.js, app.js |
| 8 | Results screen | screens.js, app.js |
| 9 | PWA polish | sw.js, style.css |
| 10 | Content expansion | rules.json, quiz.json |

**Total tasks:** 10 (Tasks 1-9 are core, Task 10 is optional content expansion)
