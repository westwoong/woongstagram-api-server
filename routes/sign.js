const crypto = require('crypto');
const { User } = require('../models');

const signUp = async (req, res) => {
    const { name, nickname, password, phoneNumber } = req.body;
    console.log(name, nickname, password, phoneNumber);
    // 닉네임 검증
    const CheckDuplicateNickName = await User.findOne({ attributes: ['nickname'], where: { nickname } });
    if (CheckDuplicateNickName) {
        return res.status(400).send("이미 존재하는 닉네임 입니다.");
    }
    if (!nickname || nickname.length < 3 || nickname.length > 11) {
        return res.status(400).send("닉네임을 3글자 이상 10글자 이상으로 기재해주시기 바랍니다.");
    }
    const CheckVaildNickName = /^[a-zA-Z0-9_]+$/; //
    if (!CheckVaildNickName.test(nickname)) {
        return res.status(400).send(`잘못된 닉네임입니다, 닉네임은 영어, 숫자, "_"로만 구성이 가능합니다.`);
    }

    // 휴대폰 검증
    const CheckDuplicatePhoneNumber = await User.findOne({ attributes: ['phone_number'], where: { phoneNumber } });
    if (CheckDuplicatePhoneNumber) {
        return res.status(409).send("이미 존재하는 휴대폰 번호의 계정이 있습니다.");
    }
    //첫 시작이010으로 시작하는지 확인, \d 숫자인지 확인 후 8자리로 입력되었는지 확인
    const CheckVaildatorPhoneNumber = /^010\d{8}$/;
    if (!phoneNumber || !CheckVaildatorPhoneNumber.test(phoneNumber)) {
        return res.status(400).send("잘못된 휴대폰 번호를 입력하셨습니다, 010으로 시작하는 정확한 휴대폰번호 11자리를 입력해주시기 바랍니다");
    }

    return res.status(201).send("회원가입 테스트 성공");
}

module.exports = signUp;