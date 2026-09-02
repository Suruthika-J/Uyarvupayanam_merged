export const POINTS_PER_QUESTION = 10;

export const GAME_LEVEL = 1;

export const computeResult = (correctCount, totalQuestions) => {
  const total = totalQuestions;
  const incorrectCount = total - correctCount;
  const score = correctCount * POINTS_PER_QUESTION;
  const maxScore = total * POINTS_PER_QUESTION;
  const percentage = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  return { correct: correctCount, incorrect: incorrectCount, score, maxScore, percentage, total };
};

export const performanceLabel = (percentage) => {
  if (percentage >= 80) return { label: 'Excellent', color: '#10b981' };
  if (percentage >= 60) return { label: 'Great', color: '#3b82f6' };
  if (percentage >= 40) return { label: 'Good', color: '#f59e0b' };
  return { label: 'Keep Practicing', color: '#f43f5e' };
};

export const encouragingMessage = (percentage) => {
  if (percentage === 100) {
    return 'Wow, perfect! You are a true Pattern Master!';
  }
  if (percentage >= 80) {
    return 'Great job! You spotted the patterns like a real puzzle master!';
  }
  if (percentage >= 60) {
    return 'Nice work! Your pattern-spotting skills are growing fast!';
  }
  if (percentage >= 40) {
    return 'Good try! Look carefully and you will spot the patterns next time!';
  }
  return 'You did your best! Play again and you will get even better!';
};
