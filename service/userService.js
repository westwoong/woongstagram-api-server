const { getUserInfoByUserId } = require('../repository/userRepository');
const { followersCountByUserId, followingCountByUserId, getFollowingListByUserId, getFollowerListByUserId } = require('../repository/followRepository');
const { postCountByUserId } = require('../repository/postRepository');

module.exports.mypage = async (req, userId) => {
    const user = await getUserInfoByUserId(userId);
    const myPostCount = await postCountByUserId(userId);
    const myFollowersCount = await followersCountByUserId(userId);
    const myFollowingCount = await followingCountByUserId(userId);

    const { nickname, name } = user[0].dataValues;

    return {
        userNickname: nickname,
        userName: name,
        postCount: myPostCount,
        followerCount: myFollowersCount,
        followingCout: myFollowingCount
    };
}