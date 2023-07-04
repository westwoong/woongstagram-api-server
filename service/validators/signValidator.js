const { BadRequestException, ConflictException, UnauthorizedException } = require('../../errors/IndexException');
const { isExistByPhoneNumber, isExistByNickname } = require('../../repository/userRepository');

module.exports.validateSignUp = async (name, nickname, password, phoneNumber) => {
    validateName(name);
    validateNickname(nickname);
    validatePhoneNumber(phoneNumber);
    validatePassword(password, phoneNumber);
}

module.exports.validateSignIn = async (phoneNumber) => {
    if (!await isExistByPhoneNumber(phoneNumber)) {
        throw new BadRequestException('존재하지 않는 계정입니다.');
    }
}

module.exports.validateRefreshToken = async (refreshToken, storedRefreshToken) => {
    if (refreshToken !== storedRefreshToken.dataValues.refresh_Token) {
        throw new UnauthorizedException('본인인증에 실패하셨습니다');
    }
}

function validateName(name) {
    const isNameKorean = /^[\uac00-\ud7af]*$/;

    if (name.includes(" ")) {
        throw new BadRequestException('이름을 공백없이 입력바랍니다.');
    }

    if (!isNameKorean.test(name)) {
        throw new BadRequestException('한글로 된 이름을 입력 바랍니다.');
    }

    if (!name || name.length < 2) {
        throw new BadRequestException('1글자 이상으로 된 정확한 이름을 입력해주시기 바랍니다.');
    }
}

async function validateNickname(nickname) {
    if (!nickname || nickname.length < 3 || nickname.length > 11) {
        throw new BadRequestException('닉네임을 3글자 이상 10글자 미만으로 기재해주시기 바랍니다.');
    }

    const nicknamePattern = /^[a-zA-Z0-9_]+$/;
    if (!nicknamePattern.test(nickname)) {
        throw new BadRequestException(`잘못된 닉네임입니다, 닉네임은 영어, 숫자, _ 로만 구성이 가능합니다.`);
    }

    if (await isExistByNickname(nickname)) {
        throw new ConflictException('이미 존재하는 닉네임 입니다.');
    }

}

async function validatePhoneNumber(phoneNumber) {
    const isValidPhoneNumber = /^010\d{8}$/;

    if (!phoneNumber || !isValidPhoneNumber.test(phoneNumber)) {
        throw new BadRequestException('010으로 시작하는 정확한 휴대폰번호 11자리를 입력해주시기 바랍니다');
    }

    if (await isExistByPhoneNumber(phoneNumber)) {
        throw new ConflictException('해당 번호로 가입된 계정이 존재합니다');
    }
}

function validatePassword(password, phoneNumber) {
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
}