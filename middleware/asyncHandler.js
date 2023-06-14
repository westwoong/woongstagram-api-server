const logger = require('../utils/logger');
const HttpException = require('../errors/HttpException');
module.exports = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res);
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.statusCode).send({ message: err.message})
            }
            logger.error(err);
            logger.log(err.test);
            return res.status(500).send({ message: '에러가 발생하였습니다. 관리자에게 문의바랍니다' });
        }
    }
}