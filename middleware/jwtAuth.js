const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
require('dotenv').config('../.env');
const { BadRequestException, UnauthorizedException } = require('../errors/IndexException');
const asyncHandler = require('./asyncHandler');

const authorization = asyncHandler((req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new BadRequestException('로그인을 해주시기 바랍니다.');
    }
    let token = authHeader.substring(7);
    let payload;

    try {
        payload = jwt.verify(token, process.env.JSON_SECRETKEY);
    } catch (err) {
        if (err.message === "invalid signature") {
            logger.error(err.message);
            throw new UnauthorizedException('잘못된 토큰입니다.')
        }
        if (err.message === "jwt expired") {
            logger.error(err.message);
            throw new UnauthorizedException('유효기간이 만료된 토큰입니다.');
        } else {
            logger.error(err);
            throw new UnauthorizedException('로그인에러가 발생하였습니다, 다시 로그인해주시기 바랍니다.');
        }
    }
    if (!payload) {
        throw new UnauthorizedException('로그인을 해주시기 바랍니다.');
    }
    req.user = payload.id;
});

module.exports = authorization