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
