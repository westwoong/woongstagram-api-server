const HttpException = require('./HttpException');
class UnauthorizedException extends HttpException {
  constructor(message) {
    super(message, 401);
  }
}

module.exports = UnauthorizedException;
