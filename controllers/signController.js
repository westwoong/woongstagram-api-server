const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException } = require('../errors/IndexException');
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

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    if (!refreshToken) {
        throw new BadRequestException('refreshToken 값이 존재하지 않습니다.');
    }

    const result = await signService.requestSendRefreshToken(userId, refreshToken);
    return res.status(200).send({ accessToken: result });
})