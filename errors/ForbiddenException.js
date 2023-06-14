const HttpException = require('./HttpException');
class ForbiddenException extends HttpException {
    constructor(message) {
        super(message, 403);
    }
}

module.exports = ForbiddenException;