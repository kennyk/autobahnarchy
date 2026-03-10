# New Interstitial Screens Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Instructions, Handoff, and Victory screens to the game flow.

**Architecture:** Three new `<div class="screen">` elements in `index.html`, toggled via the existing `showScreen()` function. Handoff and Victory screens are single HTML elements with content swapped dynamically in JS. Flow orchestration updated in `app.js`.

**Tech Stack:** Vanilla JS (ES modules), HTML5, CSS3. No build step, no test framework.

**Spec:** `docs/superpowers/specs/2026-03-10-new-screens-design.md`

---

## Chunk 1: HTML and CSS

### Task 1: Add HTML markup for new screens

**Files:**
- Modify: `index.html:25-26` (insert before Study Screen)
- Modify: `index.html:54-59` (insert before Results Screen)

- [ ] **Step 1: Add Instructions screen markup**

Insert between the Title Screen and Study Screen divs in `index.html`:

```html
<!-- Instructions Screen -->
<div id="screen-instructions" class="screen">
  <div class="interstitial-card">
    <img src="assets/study-time.png" alt="Study Time" class="interstitial-img">
    <p class="interstitial-text">Flip through the rules to study up. When you're ready, hit START QUIZ!</p>
    <button id="btn-instructions-go" class="btn btn-accent">LET'S GO!</button>
  </div>
</div>
```

- [ ] **Step 2: Add Handoff screen markup**

Insert between the Quiz Screen and Results Screen divs:

```html
<!-- Handoff Screen (2-player only, content swapped per player) -->
<div id="screen-handoff" class="screen">
  <div class="interstitial-card">
    <img id="handoff-img" src="" alt="" class="interstitial-img">
    <p id="handoff-text" class="interstitial-text"></p>
    <button id="btn-handoff-go" class="btn btn-accent">GO!</button>
  </div>
</div>
```

- [ ] **Step 3: Add Victory screen markup**

Insert between the new Handoff Screen and Results Screen divs:

```html
<!-- Victory Screen (2-player only, content swapped per outcome) -->
<div id="screen-victory" class="screen">
  <div class="interstitial-card">
    <img id="victory-img" src="" alt="" class="victory-img">
    <h2 id="victory-text" class="victory-text"></h2>
    <button id="btn-victory-summary" class="btn btn-accent">SEE SUMMARY</button>
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add HTML markup for instructions, handoff, and victory screens"
```

### Task 2: Add CSS styles for new screens

**Files:**
- Modify: `css/style.css` (append before responsive adjustments section at line 381)

- [ ] **Step 1: Add interstitial screen styles**

Add before the `/* Responsive adjustments */` section:

```css
/* Interstitial Screens (Instructions, Handoff) */
.interstitial-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 350px;
  padding: 20px;
}

.interstitial-img {
  max-width: 200px;
  height: auto;
  margin-bottom: 30px;
  image-rendering: pixelated;
}

.interstitial-img[src=""],
.interstitial-img:not([src]) {
  display: none;
}

.interstitial-text {
  font-size: 0.65rem;
  line-height: 1.8;
  margin-bottom: 30px;
  text-align: center;
}

/* Victory Screen */
.victory-img {
  max-width: 250px;
  height: auto;
  margin-bottom: 20px;
  image-rendering: pixelated;
}

.victory-img[src=""],
.victory-img:not([src]),
.victory-img.hidden {
  display: none;
}

.victory-text {
  font-size: 1rem;
  color: var(--accent);
  margin-bottom: 25px;
  animation: pulse 0.5s ease-in-out infinite alternate;
}
```

- [ ] **Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: add CSS styles for interstitial and victory screens"
```

---

## Chunk 2: Screen functions and flow wiring

### Task 3: Add screen render/init functions in screens.js

**Files:**
- Modify: `js/screens.js` (add new exports)

- [ ] **Step 1: Add initInstructionsScreen function**

Add after `initTitleScreen`:

```javascript
// Initialize instructions screen event handlers
export function initInstructionsScreen(onGo) {
  document.getElementById('btn-instructions-go').addEventListener('click', onGo);
}
```

- [ ] **Step 2: Add renderHandoff and initHandoffScreen functions**

Add after `initInstructionsScreen`:

```javascript
// Render handoff screen for a specific player
export function renderHandoff(playerNumber) {
  const img = document.getElementById('handoff-img');
  const text = document.getElementById('handoff-text');

  if (playerNumber === 1) {
    img.src = 'assets/masha-run.png';
    img.alt = 'Masha running';
    text.textContent = "Masha is up! Bobby no fucking peeking!";
  } else {
    img.src = 'assets/bobby-run.png';
    img.alt = 'Bobby running';
    text.textContent = "Bobby is up! Masha, please kindly look away.";
  }
}

// Initialize handoff screen event handlers
export function initHandoffScreen(onGo) {
  document.getElementById('btn-handoff-go').addEventListener('click', onGo);
}
```

- [ ] **Step 3: Add renderVictory and initVictoryScreen functions**

Add after `initHandoffScreen`:

```javascript
// Render victory screen based on result
export function renderVictory(result) {
  const img = document.getElementById('victory-img');
  const text = document.getElementById('victory-text');

  if (result.winner === 'tie') {
    img.src = '';
    img.classList.add('hidden');
    text.textContent = "IT'S A TIE!";
  } else if (result.winner === 'Masha') {
    img.src = 'assets/masha-victory.gif';
    img.alt = 'Masha celebrates';
    img.classList.remove('hidden');
    text.textContent = 'MASHA WINS!';
  } else {
    img.src = 'assets/bobby-victory.gif';
    img.alt = 'Bobby celebrates';
    img.classList.remove('hidden');
    text.textContent = 'BOBBY WINS!';
  }
}

// Initialize victory screen event handlers
export function initVictoryScreen(onSummary) {
  document.getElementById('btn-victory-summary').addEventListener('click', onSummary);
}
```

- [ ] **Step 4: Commit**

```bash
git add js/screens.js
git commit -m "feat: add render/init functions for instructions, handoff, and victory screens"
```

### Task 4: Wire up new flow in app.js

**Files:**
- Modify: `js/app.js:1` (update imports)
- Modify: `js/app.js:38-44` (handlePlayerSelect — go to instructions instead of study)
- Modify: `js/app.js:53-81` (handleStartQuiz — add handoff logic for 2P)
- Modify: `js/app.js:127-145` (end-of-quiz logic — replace alert with handoff/victory)
- Modify: `js/app.js:161-182` (showResults — add victory screen for 2P)
- Modify: `js/app.js:190-199` (init — wire up new screens)

- [ ] **Step 1: Add twoPlayerResult to state object**

Add `twoPlayerResult: null` to the state object at the top of `app.js` (after `quizSeed: 0`):

```javascript
  quizSeed: 0,
  twoPlayerResult: null
```

- [ ] **Step 2: Update imports**

Replace line 1 of `app.js`:

```javascript
import { showScreen, initTitleScreen, initInstructionsScreen, initStudyScreen, initQuizScreen, initHandoffScreen, initVictoryScreen, initResultsScreen, renderRule, renderHandoff, renderVictory, renderQuestion, updateAnswerSelection, showAnswerFeedback, hideFeedback, renderSinglePlayerResults, renderTwoPlayerResults } from './screens.js';
```

- [ ] **Step 3: Update handlePlayerSelect to go to instructions screen**

Replace `handlePlayerSelect` function:

```javascript
// Handle player count selection
function handlePlayerSelect(count) {
  state.playerCount = count;
  state.currentRuleIndex = 0;
  console.log(`Selected ${count} player(s)`);
  showScreen('instructions');
}
```

- [ ] **Step 4: Add handleInstructionsGo handler**

Add after `handlePlayerSelect`:

```javascript
// Handle instructions "Let's Go" button
function handleInstructionsGo() {
  renderRule(state.rules[0], 0, state.rules.length);
  showScreen('study');
}
```

- [ ] **Step 5: Update handleStartQuiz to route through handoff in 2P**

Replace `handleStartQuiz` function:

```javascript
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

  if (state.playerCount === 2) {
    // Show Masha handoff screen
    renderHandoff(1);
    showScreen('handoff');
  } else {
    // 1P: go straight to quiz
    startQuizForCurrentPlayer();
  }
}
```

- [ ] **Step 6: Add startQuizForCurrentPlayer and handleHandoffGo helpers**

Add after `handleStartQuiz`:

```javascript
// Start the quiz for the current player
function startQuizForCurrentPlayer() {
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

// Handle handoff "Go!" button
function handleHandoffGo() {
  startQuizForCurrentPlayer();
}
```

- [ ] **Step 7: Update end-of-quiz logic in handleSubmitAnswer**

Inside `handleSubmitAnswer`, replace the entire body of the `setTimeout` callback (lines 123-157). Keep the `setTimeout(() => {` opening and the `}, 1500);` closing. Replace only the inner content (`hideFeedback();` through the closing of the else block) with:

```javascript
    if (state.currentQuestionIndex >= state.selectedQuizQuestions.length) {
      // End of quiz for current player
      if (state.playerCount === 2 && state.currentPlayer === 1) {
        // Switch to player 2, show Bobby handoff
        state.currentPlayer = 2;
        state.currentQuestionIndex = 0;
        renderHandoff(2);
        showScreen('handoff');
      } else {
        // Show results (1P) or victory screen (2P)
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
```

- [ ] **Step 8: Update showResults to route through victory screen in 2P**

Replace `showResults` function:

```javascript
// Show results screen
function showResults() {
  const player1Score = calculateScore(state.player1Answers);

  if (state.playerCount === 1) {
    // 1P: go straight to results
    const missedQuestions = state.player1Answers
      .filter(a => !a.correct)
      .map(a => {
        const q = state.selectedQuizQuestions.find(q => q.id === a.questionId);
        return q ? q.questionText : '';
      })
      .filter(t => t);

    renderSinglePlayerResults(player1Score, missedQuestions);
    showScreen('results');
  } else {
    // 2P: show victory screen first
    const player2Score = calculateScore(state.player2Answers);
    const result = determineWinner(player1Score, player2Score);
    renderVictory(result);
    showScreen('victory');

    // Store result for when user clicks "See Summary"
    state.twoPlayerResult = result;
  }
}

// Handle victory "See Summary" button
function handleVictorySummary() {
  renderTwoPlayerResults(state.twoPlayerResult);
  showScreen('results');
}
```

- [ ] **Step 9: Update handlePlayAgain to reset twoPlayerResult**

Replace `handlePlayAgain` function:

```javascript
// Handle play again button
function handlePlayAgain() {
  state.twoPlayerResult = null;
  showScreen('title');
}
```

- [ ] **Step 10: Update init to wire up new screens**

Replace the screen init calls inside `init()`:

```javascript
  initTitleScreen(handlePlayerSelect);
  initInstructionsScreen(handleInstructionsGo);
  initStudyScreen(handleNextRule, handleStartQuiz);
  initQuizScreen(handleSubmitAnswer);
  initHandoffScreen(handleHandoffGo);
  initVictoryScreen(handleVictorySummary);
  initResultsScreen(handlePlayAgain);
```

- [ ] **Step 11: Commit**

```bash
git add js/app.js
git commit -m "feat: wire up instructions, handoff, and victory screen flow"
```

### Task 5: Update service worker cache

**Files:**
- Modify: `sw.js:1` (bump cache version)
- Modify: `sw.js:2-39` (add new assets to ASSETS array)

- [ ] **Step 1: Bump cache version and add new assets**

Change cache name to `autobahnarchy-v11` and add these entries to the ASSETS array:

```
'./assets/study-time.png',
'./assets/masha-run.png',
'./assets/bobby-run.png',
'./assets/masha-victory.gif',
'./assets/bobby-victory.gif',
```

- [ ] **Step 2: Commit**

```bash
git add sw.js
git commit -m "chore: bump cache version and add new screen assets to SW"
```

### Task 6: Manual smoke test

- [ ] **Step 1: Test 1-player flow**

Run `npx serve .` and open `http://localhost:3000`.

Verify: Title -> click "1 PLAYER" -> Instructions screen (study-time.png, text, "LET'S GO!" button) -> click "LET'S GO!" -> Study screen -> click "START QUIZ" -> Quiz starts for Masha -> complete quiz -> Results screen.

- [ ] **Step 2: Test 2-player flow**

Verify: Title -> click "2 PLAYERS" -> Instructions screen -> click "LET'S GO!" -> Study screen -> click "START QUIZ" -> Handoff screen (masha-run.png, "Masha is up! Bobby no fucking peeking!", "GO!" button) -> click "GO!" -> Quiz for Masha -> complete quiz -> Handoff screen (bobby-run.png, "Bobby is up! Masha, please kindly look away.", "GO!" button) -> click "GO!" -> Quiz for Bobby -> complete quiz -> Victory screen (winner's gif or tie message, "SEE SUMMARY" button) -> click "SEE SUMMARY" -> Results screen with scores.

- [ ] **Step 3: Test play again**

On results screen, click "PLAY AGAIN" -> returns to Title screen. Repeat a flow to verify state is clean.
