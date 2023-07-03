const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config('../.env');
const { BadRequestException } = require('../errors/IndexException');
const {
    createUser,
    updateRefreshTokenByUserId,
    findUserSaltByPhoneNumber,
    findUserPasswordByPhoneNumber,
    findUserPrimaryKeyByPhoneNumber,
    findRefreshTokenByUserId
} = require('../repository/userRepository');
const { validateSignUp, validateSignIn, validateRefreshToken } = require('./validators/signValidator');
const iterations = 105820;
const keylen = 64;
const accessTokenExpiresTime = '7d';
const refreshTokenExpiresTime = '60d';

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
    await validateSignIn(phoneNumber);
    const userSalt = await findUserSaltByPhoneNumber(phoneNumber);
    const userPassword = await findUserPasswordByPhoneNumber(phoneNumber);
    const salt = userSalt.map(row => row.salt).join();
    const storedHashedPassword = userPassword.map(row => row.password).join();

    return new Promise((successCallback) => {
        crypto.pbkdf2(password, salt, iterations, keylen, 'SHA512', async (err, buffer) => {
            const hashedPassword = buffer.toString('base64');
            const userPrimaryKey = await findUserPrimaryKeyByPhoneNumber(phoneNumber);
            const payload = { id: userPrimaryKey }
            const accessToken = jwt.sign(payload, process.env.JSON_SECRETKEY, { expiresIn: accessTokenExpiresTime });
            const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRETKEY, { expiresIn: refreshTokenExpiresTime });
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

    await validateRefreshToken(refreshToken, storedRefreshToken);

    const payload = { id: userId };

    return jwt.sign(payload, process.env.JSON_SECRETKEY, { expiresIn: accessTokenExpiresTime });

}