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
