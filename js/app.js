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
