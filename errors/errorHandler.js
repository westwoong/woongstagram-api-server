const HttpException = require('../errors/HttpException');
const logger = require('../utils/logger');
module.exports = (err, req, res, next) => {
    if (err instanceof HttpException) {
        return res.status(err.statusCode).send({ message: err.message })
    }
    logger.error(err);
    return res.status(500).send({ message: '에러가 발생하였습니다. 관리자에게 문의바랍니다' });
}