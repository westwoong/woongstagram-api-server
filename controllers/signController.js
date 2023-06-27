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

    await signService.sginUp(name, nickname, password, phoneNumber);

    return res.status(201).send(`회원가입이 완료되었습니다\n${nickname} 님의 아이디는 ${phoneNumber} 입니다.`);
});

module.exports.signIn = asyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;

    if (!await isExistByPhoneNumber(phoneNumber)) {
        throw new BadRequestException('존재하지 않는 계정입니다.');
    }

    const userSalt = await findUserSaltByPhoneNumber(phoneNumber);
    const userPassword = await findUserPasswordByPhoneNumber(phoneNumber);
    const salt = userSalt.map(row => row.salt).join();
    const storedHashedPassword = userPassword.map(row => row.password).join();

    crypto.pbkdf2(password, salt, 105820, 64, 'SHA512', async (err, buffer) => {
        const hashedPassword = buffer.toString('base64');
        const userPrimaryKey = await findUserPrimaryKeyByPhoneNumber(phoneNumber);
        const payload = { id: userPrimaryKey }
        const accessToken = jwt.sign(payload, process.env.JSON_SECRETKEY, { expiresIn: "7d" });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRETKEY, { expiresIn: "60d" });
        const realPrimaryKey = payload.id[0].dataValues.id;

        if (hashedPassword === storedHashedPassword) {
            await updateRefreshTokenByUserId(refreshToken, realPrimaryKey);
            return res.status(200).send({ accessToken, refreshToken });
        } else {
            throw new BadRequestException('비밀번호가 틀렸습니다.');
        }
    });
})

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