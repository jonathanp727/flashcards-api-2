import Card from '../lib/card';

function processIncrement(word, kindaKnew, operations) {
  word.card = new Card(word.card);
  word.card.increment(kindaKnew);
  operations.word.addStatement('$set', { card: word.card });
}

function processDoCard(word, responseQuality, operations) {
  word.card = new Card(word.card);
  word.card.do(responseQuality);
  operations.word.addStatement('$set', { card: word.card });
}

export default {
  processIncrement,
  processDoCard,
};
