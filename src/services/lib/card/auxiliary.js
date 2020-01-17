// Determines whether a word is in the user's card stack or not
export const isActiveCard = (card) => {
  return card !== null && card.date !== null;
}

// Determines whether a word is in the user's upcoming stack or not
export const isUpcomingCard = (card) => {
  return card !== null && card.date === null;
}
