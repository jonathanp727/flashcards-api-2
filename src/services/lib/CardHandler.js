/** 
 * Given a response value (1-5) returns whether the response indicates the user was correct.  card is
 * only used once in card file, but is necessary for other parts of application.  (expLogic)
 */
export const isReponseCorrect = response => response >= 3;

function getIsUpcoming(card) {
  return card && card.date === null;
}

function createCard() {
  return {
    ef: 2.5,
    n: 0,
    interval: 0,
    caution: false,
    date: null,
  };
}

function processIncrement(card, kindaKnew) {
  if (kindaKnew && !card.caution) {
    card = softReset(card, true);
  } else {
    card = reset(card);
    card.date = new Date();
    card.date.setHours(0,0,0,0); // Set hours, minutes, seconds, and milliseconds to 0
    card.date.setDate(card.date.getDate() + 1);
  }
  return card;
}

// Resets card to behave as completely new
function reset(card) {
  card.ef = 2.5;
  card.n = 0;
  card.interval = 0;
  card.caution = false;

  return card;
}

// Resets a card and has it appear in 7 days
function softReset(card, lowerEF = false) {
  card.date = new Date();
  card.date.setHours(0,0,0,0); // Set hours, minutes, seconds, and milliseconds to 0
  card.interval = 7;
  card.date.setDate(card.date.getDate() + card.interval);
  card.n = 3;
  card.caution = true;

  if (lowerEF) {
    // Lower EF using regular EF adjusting equation with a response value of 3
    card.ef = card.ef + (0.1 - (2) * (0.08 + (2) * 0.02));
  }

  return card;
}

/**
 * Calculation to determine whether a lookup should translate into a new card
 *
 * @param user      [Object]
 * @param word      [Object]
 * @param wordJlpt  [Object]
 * @param kindaKnew boolean
 * @return [Object]
 *    newCard: [Object] // The card to be created or null if card should not be created
 *    isNew: boolean // Whether the card is a fresh new card or if it has parematers set to perform
 *                   // differently or show up on a specific date, 
 */
export const shouldCreateCard = (userJlpt, word, wordJlpt, kindaKnew) => {
  if (kindaKnew) {
     // Return a card that is set to be done in 7 days
    const newCard = createCard();
    softReset(newCard);
    return { newCard, isNew: false };
  } else {
    // if word jlpt is at or above the user's level, OR it's at the next level
    if (wordJlpt >= userJlpt.level || word.count > 3) {
      return { newCard: new Card(), isNew: true };
    }
    return { newCard: null };
  }
};

export default {
  getIsUpcoming,
  createCard,
  processIncrement,
};
