const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config('../.env');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException, ConflictException, UnauthorizedException } = require('../errors/IndexException');
const {
    createUser,
    updateRefreshTokenByUserId,
    isExistByPhoneNumber,
    isExistByNickname,
    findUserSaltByPhoneNumber,
    findUserPasswordByPhoneNumber,
    findUserPrimaryKeyByPhoneNumber,
    findRefreshTokenByUserId
} = require('../repository/userRepository');
const signService = require('../service/signService');

module.exports.signUp = asyncHandler(async (req, res) => {
    const { name, nickname, password, phoneNumber } = req.body;

    if (!name) {
        throw new BadRequestException('name 값이 존재하지 않습니다.');
    }
    if (!nickname) {
        throw new BadRequestException('nickname 값이 존재하지 않습니다.');
    }
    if (!password) {
        throw new BadRequestException('password 값이 존재하지 않습니다.');
    }
    if (!phoneNumber) {
        throw new BadRequestException('phoneNumber 값이 존재하지 않습니다');
    }

    await signService.signUp(name, nickname, password, phoneNumber);

    return res.status(201).send(`회원가입이 완료되었습니다\n${nickname} 님의 아이디는 ${phoneNumber} 입니다.`);
});

module.exports.signIn = asyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber) {
        throw new BadRequestException('phoneNumber 값이 존재하지 않습니다');
    }

    if (!password) {
        throw new BadRequestException('password 값이 존재하지 않습니다.');
    }

    const result = await signService.signIn(phoneNumber, password);
    return res.status(200).send(result)
});

module.exports.refreshToken = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;
    const refreshToken = req.token;

    const storedRefreshToken = await findRefreshTokenByUserId(userId);

    if (refreshToken !== storedRefreshToken.dataValues.refresh_Token) {
        throw new UnauthorizedException('본인인증에 실패하셨습니다');
    }
    const payload = { id: userId };
    const accessToken = jwt.sign(payload, process.env.JSON_SECRETKEY, { expiresIn: "7d" });

    return res.status(200).send({ accessToken });
})