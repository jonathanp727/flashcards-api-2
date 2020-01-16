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
    card._reset();
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

export default {
  getIsUpcoming,
  createCard,
  processIncrement,

};
