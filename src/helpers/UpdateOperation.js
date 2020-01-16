function UpdateOperation () {
  // empty at first
}

UpdateOperation.prototype = {
  constructor: null,
  addStatement: function(operator, data) {
    if (this.hasOwnProperty(operator)) {

      // Do check to make sure we aren't overriding any data
      for (el in data) {
        if (this[operator].hasOwnProperty(el)) {
          throw new Error('Attempted to override update statement');
        }
      }

      this[operator] = { ...this[operator] , ...data };
    } else {
      this[operator] = data;
    }
  },
}

export default UpdateOperation;
