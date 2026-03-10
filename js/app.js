import { showScreen, initTitleScreen, initInstructionsScreen, initStudyScreen, initQuizScreen, initHandoffScreen, initVictoryScreen, initResultsScreen, renderRule, renderHandoff, renderVictory, renderQuestion, updateAnswerSelection, showAnswerFeedback, hideFeedback, renderSinglePlayerResults, renderTwoPlayerResults } from './screens.js';
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
  quizSeed: 0,
  twoPlayerResult: null
};

const QUESTIONS_PER_QUIZ = 10;

const PRELOAD_ASSETS = [
  'assets/title-screen-tall.gif',
  'assets/study-time.png',
  'assets/masha-run.png',
  'assets/bobby-run.png',
  'assets/masha-victory.gif',
  'assets/bobby-victory.gif',
  'assets/fonts/PressStart2P-Regular.woff2',
  'assets/signs/Zeichen_208_-_Dem_Gegenverkehr_Vorrang_gew\u00e4hren!_600x600,_StVO_1992.png',
  'assets/signs/Zeichen_209-30_-_Vorgeschriebene_Fahrtrichtung,_Geradeaus,_StVO_2017.png',
  'assets/signs/Zeichen_209_-_Vorgeschriebene_Fahrtrichtung,_rechts,_StVO_2017.png',
  'assets/signs/Zeichen_220-10_-_Einbahnstra\u00dfe,_linksweisend,_StVO_2017.png',
  'assets/signs/Zeichen_250_-_Verbot_f\u00fcr_Fahrzeuge_aller_Art,_StVO_1970.png',
  'assets/signs/Zeichen_251_-_Verbot_f\u00fcr_Kraftwagen_und_sonstige_mehrspurige_Kraftfahrzeuge,_StVO_1992.png',
  'assets/signs/Zeichen_267_-_Verbot_der_Einfahrt,_StVO_1970.png',
  'assets/signs/Zeichen_274-60_-_Zul\u00e4ssige_H\u00f6chstgeschwindigkeit,_StVO_2017.png',
  'assets/signs/Zeichen_275-30_-_Vorgeschriebene_Mindestgeschwindigkeit,_StVO_2017.png',
  'assets/signs/Zeichen_276_-_\u00dcberholverbot_f\u00fcr_Kraftfahrzeuge_aller_Art,_StVO_1992.png',
  'assets/signs/Zeichen_278-60_-_Ende_der_zul\u00e4ssigen_H\u00f6chstgeschwindigkeit,_StVO_2017.png',
  'assets/signs/Zeichen_282_-_Ende_s\u00e4mtlicher_Streckenverbote,_StVO_1970.png',
  'assets/signs/Zeichen_283_-_Absolutes_Haltverbot,_StVO_2017.png',
  'assets/signs/Zeichen_286_-_Eingeschr\u00e4nktes_Halteverbot,_StVO_1970.png',
  'assets/signs/Zeichen_306_-_Vorfahrtstra\u00dfe,_StVO_1970.png',
  'assets/signs/Zeichen_330.1_-_Autobahn,_StVO_2013.png',
  'assets/signs/Zeichen_333_-_Pfeilschild_-_Ausfahrt_von_der_Autobahn,_StVO_1980.png',
  'assets/signs/Zeichen_515-11_-_Verschwenkungstafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_264_StVO_-_zweistreifig_nach_links_(1600x1250).png',
  'assets/signs/Zeichen_523-30_-_Fahrstreifentafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_274_-_zweistreifig_in_Fahrtrichtung_(1600x1250).png',
  'assets/signs/Zeichen_524-30_-_Fahrstreifentafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_253_-_zweistreifig_in_Fahrtrichtung_(1600x1250).png',
  'assets/signs/Zeichen_525-31_-_Fahrstreifentafel_-_ohne_Gegenverkehr_mit_integriertem_Zeichen_275_-_dreistreifig_in_Fahrtrichtung_(1600x1250).png',
  'assets/signs/Zeichen_531-11_-_Einengungstafel,_Darstellung_ohne_Gegenverkehr-_noch_zwei_Fahrstreifen_links_in_Fahrtrichtung,_StVO_1992.png',
  'assets/signs/town-entry.png',
  'assets/signs/town-exit.png'
];

// Load JSON data
async function loadData() {
  try {
    const [rulesRes, quizRes] = await Promise.all([
      fetch('./data/rules.json'),
      fetch('./data/quiz.json')
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
  showScreen('instructions');
}

// Handle instructions "Let's Go" button
function handleInstructionsGo() {
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

  if (state.playerCount === 2) {
    // Show Masha handoff screen
    renderHandoff(1);
    showScreen('handoff');
  } else {
    // 1P: go straight to quiz
    startQuizForCurrentPlayer();
  }
}

// Start the quiz for the current player
function startQuizForCurrentPlayer() {
  state.selectedAnswerIndices = [];
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
  }, 1500);
}

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

// Handle play again button
function handlePlayAgain() {
  state.twoPlayerResult = null;
  showScreen('title');
}

// Preload a single asset, fully downloading it
function preloadOne(url) {
  if (url.match(/\.(png|gif|jpg|jpeg)$/i)) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = url;
    });
  }
  return fetch(url).then(r => r.blob()).catch(() => {});
}

// Preload assets with progress bar
async function preloadAssets() {
  const fill = document.getElementById('loading-bar-fill');
  let loaded = 0;
  const total = PRELOAD_ASSETS.length;

  await Promise.all(PRELOAD_ASSETS.map(url =>
    preloadOne(url).finally(() => {
      loaded++;
      fill.style.width = `${(loaded / total) * 100}%`;
    })
  ));
}

// Initialize app
async function init() {
  console.log('Autobahnarchy initializing...');
  registerServiceWorker();
  initInstallButton();
  await Promise.all([loadData(), preloadAssets()]);
  initTitleScreen(handlePlayerSelect);
  initInstructionsScreen(handleInstructionsGo);
  initStudyScreen(handleNextRule, handleStartQuiz);
  initQuizScreen(handleSubmitAnswer);
  initHandoffScreen(handleHandoffGo);
  initVictoryScreen(handleVictorySummary);
  initResultsScreen(handlePlayAgain);
  showScreen('title');
}

// PWA install prompt
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('btn-install');
  btn.classList.remove('hidden');
});

function initInstallButton() {
  const btn = document.getElementById('btn-install');
  btn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log(`Install prompt outcome: ${outcome}`);
    deferredInstallPrompt = null;
    btn.classList.add('hidden');
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  document.getElementById('btn-install').classList.add('hidden');
  console.log('App installed');
});

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
      console.log('Service worker registered');
    } catch (error) {
      console.log('Service worker registration failed:', error);
    }
  }
}

// Start the app
init();
