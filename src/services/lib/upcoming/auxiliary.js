// A freshly updated new limit will be set to negative to let autofill know to run again
// in the case that it has already been run today.
export const updateDailyNewCardLimit = (newLimit) => {
  return -1 * newLimit;
}

// Returns if the dailyNewCardLimit is freshly updated.
export const checkLimitIsFresh = (newLimit) => {
  return newLimit < 0;
}

// Removes the negative from dailyNewCardLimit
export const markLimitNotFresh = (newLimit) => {
  return Math.abs(newLimit);
}

/** 
 * Returns the number of new cards left for a user to start today
 *
 * @param upcomingCardsDone Number  How many upcoming have been done already today
 * @param dailyNewCardLimit Number
 * @return                  Number
 */
export const getUpcomingLeftToday = (dailyNewCardLimit, upcomingCardsDone) => {
  return Math.abs(dailyNewCardLimit) - upcomingCardsDone;
}
