const { User } = require('../models');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config('../.env');
const asyncHandler = require('../middleware/asyncHandler');
const { BadRequestException, ConflictException, UnauthorizedException } = require('../errors/IndexException');
const {
    createUser,
    updateRefreshTokenByUserId,
    isExistByPhoneNumber,
    findUserSaltByPhoneNumber,
    findUserPasswordByPhoneNumber,
    findUserPrimaryKeyByPhoneNumber,
    findRefreshTokenByUserId
} = require('../repository/userRepository');


module.exports.signUp = asyncHandler(async (req, res) => {
    const { name, nickname, password, phoneNumber } = req.body;

    if (name.includes(" ")) {
        throw new BadRequestException('이름을 공백없이 입력바랍니다.');
    }

    const isNameKorean = /^[\uac00-\ud7af]*$/;
    if (!isNameKorean.test(name)) {
        throw new BadRequestException('한글로 된 이름을 입력 바랍니다.');
    }
    if (!name || name.length < 2) {
        throw new BadRequestException('1글자 이상으로 된 정확한 이름을 입력해주시기 바랍니다.');
    }

    const isNicknameInUse = await User.findOne({ attributes: ['nickname'], where: { nickname } });
    if (isNicknameInUse) {
        throw new ConflictException('이미 존재하는 닉네임 입니다.');
    }

    if (!nickname || nickname.length < 3 || nickname.length > 11) {
        throw new BadRequestException('닉네임을 3글자 이상 10글자 이상으로 기재해주시기 바랍니다.');
    }

    const nicknamePattern = /^[a-zA-Z0-9_]+$/;
    if (!nicknamePattern.test(nickname)) {
        throw new BadRequestException(`잘못된 닉네임입니다, 닉네임은 영어, 숫자, _ 로만 구성이 가능합니다.`);
    }

    const isPhoneNumberInUse = await User.findOne({ attributes: ['phone_number'], where: { phoneNumber } });
    if (isPhoneNumberInUse) {
        throw new ConflictException('해당 번호로 가입된 계정이 존재합니다');
    }

    const isValidPhoneNumber = /^010\d{8}$/;
    if (!phoneNumber || !isValidPhoneNumber.test(phoneNumber)) {
        throw new BadRequestException('010으로 시작하는 정확한 휴대폰번호 11자리를 입력해주시기 바랍니다');
    }

    if (!password || password.length < 9) {
        throw new BadRequestException('비밀번호는 최소 9자리 이상을 입력 바랍니다');
    }

    let PasswordValid = 0;

    const LowerCase = /[a-z]/g;
    if (LowerCase.test(password)) {
        PasswordValid++;
    }

    const UpperCase = /[A-Z]/g;
    if (UpperCase.test(password)) {
        PasswordValid++;
    }

    const Nummber = /[0-9]/g;
    if (Nummber.test(password)) {
        PasswordValid++;
    }

    const SpesialPattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
    if (SpesialPattern.test(password)) {
        PasswordValid++;
    }

    if (PasswordValid < 3) {
        throw new BadRequestException('비밀번호는 영대문자, 영소문자, 숫자, 특수문자 중 3가지 이상이 포함되어있어야합니다');
    }

    const isPasswordIncludePhoneNumber =
        password.includes(phoneNumber.slice(3, 7)) ||
        password.includes(phoneNumber.slice(-4));

    if (isPasswordIncludePhoneNumber) {
        throw new BadRequestException('비밀번호에 연속된 휴대폰번호가 포함되어있으면 안됩니다!');
    }

    crypto.randomBytes(64, (err, buffer) => {
        const salt = buffer.toString('base64');

        crypto.pbkdf2(password, salt, 105820, 64, 'SHA512', async (err, buffer) => {
            const hashedPassword = buffer.toString('base64');

            await createUser(phoneNumber, name, nickname, salt, hashedPassword);
            res.status(201).send(`회원가입이 완료되었습니다\n${nickname} 님의 아이디는 ${phoneNumber} 입니다.`);
        });
    });
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