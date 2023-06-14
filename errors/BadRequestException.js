const HttpException = require('./HttpException');
class BadRequestException extends HttpException {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = BadRequestException;
