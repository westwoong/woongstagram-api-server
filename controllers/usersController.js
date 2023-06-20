const { User, Follower, Post } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

module.exports.getMyInformation = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;
    const user = User.findOne({ where: { id: userId }, attributes: ['nickname', 'name'] });
    const myPostCount = await Post.count({ where: { userId } });
    const myFollowersCount = await Follower.count({ where: { followerId: userId } });
    const myFollowingCount = await Follower.count({ where: { followId: userId } });

    return res.status(200).send({
        userNickname: user.nickname,
        userName: user.name,
        postCount: myPostCount,
        followerCount: myFollowersCount,
        followingCout: myFollowingCount
    });
});

module.exports.getMyFollowingList = asyncHandler(async (req, res) => {
    const userId = req.user[0].id;
    const MyFollowingList = await Follower.findAll({ where: { followerId: userId } });
    const followingList = [];

    for (const following of MyFollowingList) {
        const followingUser = await User.findOne({
            where: { id: following.followId },
            attributes: ['nickname', 'name']
        });
        const { nickname, name } = followingUser;
        followingList.push({ nickname, name });
    }
    return res.status(200).send({ followingList });
});

module.exports.getMyFollowerList = asyncHandler(async (req, res) => {
    const followId = req.user[0].id;
    const followerList = [];

    const followers = await Follower.findAll({ where: { followId } });

    for (const follower of followers) {
        const followerUser = await User.findOne({
            where: { id: follower.followerId },
            attributes: ['nickname', 'name']
        });
        const { nickname, name } = followerUser;
        followerList.push({ nickname, name })
    }

    return res.status(200).send({ followers: followerList });
});