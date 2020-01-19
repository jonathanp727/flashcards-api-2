function UpdateOperation () {
  this.operation = {};
}

UpdateOperation.prototype = {
  constructor: UpdateOperation,
  addStatement: function(operator, data) {
    if (this.operation.hasOwnProperty(operator)) {

      // Do check to make sure we aren't overriding any data
      for (const el in data) {
        if (this.operation[operator].hasOwnProperty(el)) {
          throw new Error('Attempted to override update statement');
        }
      }

      this.operation[operator] = { ...this.operation[operator] , ...data };
    } else {
      this.operation[operator] = data;
    }
  },
  // Return the full operation to be passed into Mongo
  generate: function() {
    return this.operation;
  }
}

export default UpdateOperation;
