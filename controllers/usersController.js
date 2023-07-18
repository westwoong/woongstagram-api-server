const { BadRequestException } = require('../errors/IndexException');
const asyncHandler = require('../middleware/asyncHandler');
const userService = require('../service/userService');

module.exports.getMyInformation = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    const result = await userService.mypage(req, userId);
    return res.status(200).send(result);
});

module.exports.getMyFollowingList = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    const result = await userService.userFollowingList(req, userId);
    return res.status(200).send({ folloingList: result });
});

module.exports.getMyFollowerList = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;

    if (!userId) {
        throw new BadRequestException('userId 값이 존재하지 않습니다.');
    }

    const result = await userService.userFollowerList(req, userId);

    return res.status(200).send({ followerList: result });
});