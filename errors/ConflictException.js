const HttpException = require('./HttpException');
class ConflictException extends HttpException {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = ConflictException;
