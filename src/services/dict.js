/**
 * Increments the lookup counter of a word for a particular user and determines
 * if the word should be added to the "upcoming" flashcards array.
 *
 * @param userId     ObjectId
 * @param wordId     ObjectId
 * @param wordJlpt   { level: Number, index: Number }
 * @param kindaKnew  boolean   // Marks whether the user kind of knew the word or didn't at all
 */
async function increment(userId, data) {

}

/**
 * Gets all words in a dictionary that matches a query and updates user lookup history.
 *
 * @param userId     ObjectId
 * @param wordId     ObjectId
 * @param wordJlpt   { level: Number, index: Number }
 * @param kindaKnew  boolean   // Marks whether the user kind of knew the word or didn't at all
 */
async function lookup(query) {
  // https://stackoverflow.com/questions/29932723/how-to-limit-an-array-size-in-mongodb
  // ^ for pushing to user recent lookups
}

export default {
  increment,
  lookup,
};
