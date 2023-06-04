const HttpException = require('./HttpException');
module.exports = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res);
        } catch (err) {
            if (err instanceof HttpException) {
                return res.status(err.statusCode).send({ message: err.message})
            }
            console.log('----error start----');
            console.error(err);
            console.log(err.test);
            console.log('----error done----')
            return res.status(500).send({ message: '에러가 발생하였습니다. 관리자에게 문의바랍니다' });
        }
    }
}