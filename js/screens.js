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
