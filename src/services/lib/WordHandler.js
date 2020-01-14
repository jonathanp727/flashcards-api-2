function createWord({ userId, wordId, stats, card = null, jlpt }) {
  return {
    userId,
    wordId,
    auxiliaryData: {
      sentences: [],
      notes: "",
    },
    card,
    stats,
    jlpt,
  };
}

export default {
  createWord,
};
