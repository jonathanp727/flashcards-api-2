function createWord({ userId, wordId, stats, card = null, jlpt }) {
  userId,
  wordId,
  auxiliaryData: {
    sentences: [],
    notes: "",
  },
  card,
  stats,
  jlpt,
}

export default {
  createWord,
};
