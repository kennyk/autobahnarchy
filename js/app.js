import { showScreen, initTitleScreen, initStudyScreen, initQuizScreen, initResultsScreen, renderRule, renderQuestion, updateAnswerSelection, showAnswerFeedback, hideFeedback, renderSinglePlayerResults, renderTwoPlayerResults } from './screens.js';
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

// Handle play again button
function handlePlayAgain() {
  showScreen('title');
}

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
