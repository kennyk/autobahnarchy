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

// Initialize app
async function init() {
  console.log('Autobahnarchy initializing...');
  registerServiceWorker();
  initInstallButton();
  await loadData();
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
