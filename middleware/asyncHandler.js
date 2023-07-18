require('dotenv').config('../.env');
module.exports = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res);
        } catch (err) {
            if (process.env.SERVER_SETTING == 'DEV') {
                console.log(err);
            }
            next(err);
        }
    }
}