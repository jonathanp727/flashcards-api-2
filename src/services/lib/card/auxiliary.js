// Determines whether a word is in the user's card stack or not
export const isActiveCard = (card) => {
  return card !== null && card.date !== null;
}

// Determines whether a word is in the user's upcoming stack or not
export const isUpcomingCard = (card) => {
  return card !== null && card.date === null;
}

/** 
 * Given a response value (1-5) returns whether the response indicates the user was correct.
 */
export const isReponseCorrect = response => response >= 3;
