import { isSameDay } from '../../../helpers/date';

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
 * @param lastSession       Object  { date: Date, upcomingCardsDone: Number }
 * @param dailyNewCardLimit Number
 * @return                  Number
 */
export const getUpcomingLeftToday = (lastSession, dailyNewCardLimit) => {
  return isSameDay(lastSession.date) ?
      Math.abs(dailyNewCardLimit) - lastSession.upcomingCardsDone :
      Math.abs(dailyNewCardLimit);
}
