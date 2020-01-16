const NUM_CATEGORIES = 5;

function createUserStats(jlptLevel = 5) {
  return {
    jlpt: {
      level: jlptLevel,
      index: 0,
    },
    categories: Array(NUM_CATEGORIES).fill(0),
    exp: 0,
    level: 1,
  };
}

function createWordStats() {
  return {
    inc: {
      count: 0,
      dates: [],
    },
    card: {
      curStreak: 0,
      maxStreak: 0,
    },
  };
}

export default {
  createUserStats,
  createWordStats,
};
