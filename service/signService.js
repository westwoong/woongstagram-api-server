const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config('../.env');
const { BadRequestException, UnauthorizedException } = require('../errors/IndexException');
const {
    createUser,
    updateRefreshTokenByUserId,
    isExistByPhoneNumber,
    findUserSaltByPhoneNumber,
    findUserPasswordByPhoneNumber,
    findUserPrimaryKeyByPhoneNumber,
    findRefreshTokenByUserId
} = require('../repository/userRepository');
const { validateSignUp } = require('./validators/signValidator');

module.exports.signUp = async (name, nickname, password, phoneNumber) => {
    await validateSignUp(name, nickname, password, phoneNumber);

    crypto.randomBytes(64, (err, buffer) => {
        const salt = buffer.toString('base64');

        crypto.pbkdf2(password, salt, 105820, 64, 'SHA512', async (err, buffer) => {
            const hashedPassword = buffer.toString('base64');
            await createUser(phoneNumber, name, nickname, salt, hashedPassword);
        });
    });
    return
}

module.exports.signIn = async (phoneNumber, password) => {
    if (!await isExistByPhoneNumber(phoneNumber)) {
        throw new BadRequestException('존재하지 않는 계정입니다.');
    }

    const userSalt = await findUserSaltByPhoneNumber(phoneNumber);
    const userPassword = await findUserPasswordByPhoneNumber(phoneNumber);
    const salt = userSalt.map(row => row.salt).join();
    const storedHashedPassword = userPassword.map(row => row.password).join();

    return new Promise((successCallback) => {
        crypto.pbkdf2(password, salt, 105820, 64, 'SHA512', async (err, buffer) => {
            const hashedPassword = buffer.toString('base64');
            const userPrimaryKey = await findUserPrimaryKeyByPhoneNumber(phoneNumber);
            const payload = { id: userPrimaryKey }
            const accessToken = jwt.sign(payload, process.env.JSON_SECRETKEY, { expiresIn: "7d" });
            const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRETKEY, { expiresIn: "60d" });
            const realPrimaryKey = payload.id[0].dataValues.id;

            if (hashedPassword === storedHashedPassword) {
                await updateRefreshTokenByUserId(refreshToken, realPrimaryKey);
                successCallback({ accessToken, refreshToken });
            } else {
                throw new BadRequestException('비밀번호가 틀렸습니다.');
            }
        });
    });
}

module.exports.requestSendRefreshToken = async (userId, refreshToken) => {
    const storedRefreshToken = await findRefreshTokenByUserId(userId);

    if (refreshToken !== storedRefreshToken.dataValues.refresh_Token) {
        throw new UnauthorizedException('본인인증에 실패하셨습니다');
    }

    const payload = { id: userId };

    return jwt.sign(payload, process.env.JSON_SECRETKEY, { expiresIn: "7d" });

}