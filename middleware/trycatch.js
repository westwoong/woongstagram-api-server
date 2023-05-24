module.exports = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res);
        } catch (err) {
            console.log('----error start----');
            console.error(err);
            console.log('----error done----')
            res.status(500).send({ message: '에러가 발생하였습니다. 관리자에게 문의바랍니다' });
        }
    }
}