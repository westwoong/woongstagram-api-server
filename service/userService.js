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

module.exports.userFollowingList = async (req, userId) => {
    const followingList = [];

    const myFollowingList = await getFollowingListByUserId(userId);

    for (const following of myFollowingList) {
        const followingUser = await getUserInfoByUserId(following.followId);
        const { nickname, name } = followingUser[0].dataValues;
        followingList.push({ nickname, name });
    }
    return followingList
}

module.exports.userFollowerList = async (req, userId) => {
    const followerList = [];

    const followers = await getFollowerListByUserId(userId);

    for (const follower of followers) {
        const followerUser = await getUserInfoByUserId(follower.followerId);
        const { nickname, name } = followerUser[0].dataValues;
        followerList.push({ nickname, name })
    }
    return followerList;
}