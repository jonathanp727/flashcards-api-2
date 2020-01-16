import UserStats from '../lib/stats/user';
import Card from '../lib/card';
import Upcoming from '../lib/upcoming';

// Default user schema to be used whenever creating a new word in the db
function User({ name, email, passwordHash, saltHex, jlptLevel }) {
  this.general = {
    username: name,
    email,
    passwordHash,
    salt: saltHex,
    timezone: 0,
  };
  this.upcoming = new Upcoming();
  this.stats = new UserStats(null, jlptLevel);
  this.settings = {};
  this.history = {
    lastSession: {
      date: null,
      upcomingCardsDone: 0,
    },
    recentLookups: [],
  };
}

export default User;
