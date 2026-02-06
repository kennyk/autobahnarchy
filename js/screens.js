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
