const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
require('dotenv').config('../.env');

const RefreshAuthorization = (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).send('로그인을 해주시기 바랍니다.');
    }
    let token = authHeader.substring(7);
    let payload;

    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRETKEY); // refresh 토큰 검증
    } catch (err) {
        if (err.message === "invalid signature") {
            logger.error(err.message);
            return res.status(401).send("잘못된 토큰입니다.");
        }
        if (err.message === "jwt expired") {
            logger.error(err.message);
            return res.status(401).send("유효기간이 만료된 토큰입니다.");
        } else {
            logger.error(err);
            return res.status(401).send("로그인에러가 발생하였습니다 다시 로그인해주시기 바랍니다.");
        }
    }
    if (!payload) {
        return res.status(401).send('로그인을 해주시기 바랍니다.');
    }
    req.user = payload.id;
    req.token = token;
    next();
};

module.exports = RefreshAuthorization;