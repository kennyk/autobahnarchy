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
