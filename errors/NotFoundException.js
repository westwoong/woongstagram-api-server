const HttpException = require('./HttpException');
class NotFoundException extends HttpException {
    constructor(message) {
        super(message, 404);
    }
}

module.exports = NotFoundException;