const { getUserInfoByUserId } = require('../repository/userRepository');
const { getFollowingListByUserId, getFollowerListByUserId } = require('../repository/followRepository');
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
    const followingList = [];

    const MyFollowingList = await getFollowingListByUserId(userId);

    for (const following of MyFollowingList) {
        const followingUser = await getUserInfoByUserId(following.followId);
        const { nickname, name } = followingUser[0].dataValues;
        followingList.push({ nickname, name });
    }
    return res.status(200).send({ followingList });
});

module.exports.getMyFollowerList = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;
    const followerList = [];

    const followers = await getFollowerListByUserId(userId);

    for (const follower of followers) {
        const followerUser = await getUserInfoByUserId(follower.followerId);
        const { nickname, name } = followerUser[0].dataValues;
        followerList.push({ nickname, name })
    }

    return res.status(200).send({ followerList });
});