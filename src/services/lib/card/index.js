import moment from 'moment';
import { isReponseCorrect } from './auxiliary';

function Card (card = null, delayed = false) {
  if (card) {
    this.ef = card.ef;
    this.n = card.n;
    this.interval = card.interval;
    this.date = card.date;
    // `caution` is a boolean value that is set to true when an existing card was kindaKnew incremented and before it's
    // next appearance in the flashcard deck.  If a card is incremented again before it's next appearance in the flashcard
    // deck, reset card regardless of kindaKnew.
    this.caution = card.caution;
  } else {
    // Creating a card with delayed set to true creates a card that appears x days 
    // in the future instead of right away
    if (delayed) {
      this._softReset();
    } else {
      this.date = null;
      this._reset();
    }
  }
}

Card.prototype = {
  constructor: Card,
  // Processes card after it's done by user, returns whether user was correct or not (whether they should redo)
  do: function (response) {
    this.caution = false;

    const isCorrect = isReponseCorrect(response);
    if (!isCorrect) {
      this.n = 1;
    } else {
      this.n += 1;
    }

    this.ef = this.ef + (0.1 - (5 - response) * (0.08 + (5 - response) * 0.02));

    if (this.ef < 1.3) this.ef = 1.3;

    if (this.n == 1) {
      this.interval = 1;
    } else if (this.n == 2) {
      this.interval = 6;
    } else {
      this.interval = this.interval * this.ef;
      this.interval = Math.round(this.interval);
    }
    this.date = getDateWithInterval(this.interval);

    return isCorrect;
  },
  increment: function (kindaKnew) {
    if (kindaKnew && !this.caution) {
      this._softReset(true);
    } else {
      this._reset();
      this.date = getDateWithInterval(1);
    }
  },
  // Resets card to behave as completely new
  _reset: function () {
    this.ef = 2.5;
    this.n = 0;
    this.interval = 0;
    this.caution = false;
  },
  _softReset: function (lowerEF = false) {
    this.interval = 7;
    this.date = getDateWithInterval(this.interval);
    this.n = 3;
    this.caution = true;

    if (lowerEF) {
      // Lower EF using regular EF adjusting equation with a response value of 3
      this.ef = this.ef + (0.1 - (2) * (0.08 + (2) * 0.02));
    }
  },
}

// Returns the epoch time in ms of today + interval days
function getDateWithInterval(interval) {
  const d = moment();
  d.startOf('day'); // Set hours, minues, seconds, and ms to 0
  d.add(interval, 'days');
  return d.valueOf();
}

export default Card;
