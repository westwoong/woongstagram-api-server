const { getUserInfoByUserId } = require('../repository/userRepository');
const { followersCountByUserId, followingCountByUserId, getFollowingListByUserId, getFollowerListByUserId } = require('../repository/followRepository');
const { postCountByUserId } = require('../repository/postRepository');
const asyncHandler = require('../middleware/asyncHandler');

module.exports.getMyInformation = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;

    const user = await getUserInfoByUserId(userId);
    const myPostCount = await postCountByUserId(userId);
    const myFollowersCount = await followersCountByUserId(userId);
    const myFollowingCount = await followingCountByUserId(userId);

    const { nickname, name } = user[0].dataValues;

    return res.status(200).send({
        userNickname: nickname,
        userName: name,
        postCount: myPostCount,
        followerCount: myFollowersCount,
        followingCout: myFollowingCount
    });
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