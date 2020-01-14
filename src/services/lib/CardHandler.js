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

export default {
  getIsUpcoming,
  createCard,
};
